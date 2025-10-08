import { useEffect, useState } from 'react';
import pusher from '../utils/pusher';

interface Notification {
  notificationID: number;
  userID: number | null;
  title: string;
  label?: "Booking" | "Payment" | "Reschedule" | "Cancellation" | "Reminder" | "Promotion" | "System" | "Gallery" | "Support";
  message: string;
  time: string;
  starred?: boolean;
  bookingID?: number;
  transID?: number;
}

export const useNotifications = (userID: number | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userID) {
      return;
    }

    // Subscribe to the user's private channel
    const channel = pusher.subscribe(`private-user.${userID}`);

    // Channel event listeners for debugging
    channel.bind('pusher:subscription_succeeded', () => {});

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error(`Failed to subscribe to private-user.${userID}:`, error);
    });

    // Listen for gallery image confirmations
    channel.bind('gallery.images.confirmed', (data: any) => {
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
  // (Optional) trigger toast here
    });

    // Listen for booking status updates
    channel.bind('booking.status.updated', (data: any) => {
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
    });

    // Listen for payment status updates
    channel.bind('payment.status.updated', (data: any) => {
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
    });

    // Listen for message sent confirmation (system notification after user sends a message)
    channel.bind('message.sent', (data: any) => {
      const newNotification = data.notification;
      if (!newNotification) return;
      setNotifications(prev => {
        // Prevent duplicates by notificationID + title+time fallback
        const exists = prev.some(n => n.notificationID === newNotification.notificationID);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
    });

    // Listen for system welcome notification on registration
    channel.bind('system.notification.created', (data: any) => {
      const newNotification = data.notification;
      if (!newNotification) return;
      setNotifications(prev => {
        const exists = prev.some(n => n.notificationID === newNotification.notificationID);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
    });

    // Listen for support reply notifications
    channel.bind('support.reply.created', (data: any) => {
      const newNotification = data.notification;
      if (!newNotification) return;
      setNotifications(prev => {
        const exists = prev.some(n => n.notificationID === newNotification.notificationID);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
    });

    // Listen for booking requests (reschedule/cancellation) for admins
    channel.bind('booking.request.submitted', (data: any) => {
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-user.${userID}`);
    };
  }, [userID]);

  return { notifications, setNotifications };
};