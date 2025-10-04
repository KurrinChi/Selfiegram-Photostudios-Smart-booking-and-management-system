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
      console.log('No userID provided for Pusher subscription');
      return;
    }

    console.log(`Subscribing to Pusher channel: private-user.${userID}`);

    // Subscribe to the user's private channel
    const channel = pusher.subscribe(`private-user.${userID}`);

    // Channel event listeners for debugging
    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Successfully subscribed to private-user.${userID}`);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error(`Failed to subscribe to private-user.${userID}:`, error);
    });

    // Listen for gallery image confirmations
    channel.bind('gallery.images.confirmed', (data: any) => {
      console.log('Received gallery.images.confirmed event:', data);
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
      
      // You can add toast notification here
      console.log('New gallery notification added to state:', newNotification);
    });

    // Listen for booking status updates
    channel.bind('booking.status.updated', (data: any) => {
      console.log('Received booking.status.updated event:', data);
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
      
      console.log('New booking notification added to state:', newNotification);
    });

    // Listen for payment status updates
    channel.bind('payment.status.updated', (data: any) => {
      console.log('Received payment.status.updated event:', data);
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
      
      console.log('New payment notification added to state:', newNotification);
    });

    // Listen for message sent confirmation (system notification after user sends a message)
    channel.bind('message.sent', (data: any) => {
      console.log('Received message.sent event:', data);
      const newNotification = data.notification;
      if (!newNotification) return;
      setNotifications(prev => {
        // Prevent duplicates by notificationID + title+time fallback
        const exists = prev.some(n => n.notificationID === newNotification.notificationID);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
      console.log('New message notification added to state:', newNotification);
    });

    // Listen for system welcome notification on registration
    channel.bind('system.notification.created', (data: any) => {
      console.log('Received system.notification.created event:', data);
      const newNotification = data.notification;
      if (!newNotification) return;
      setNotifications(prev => {
        const exists = prev.some(n => n.notificationID === newNotification.notificationID);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
      console.log('New system notification added to state:', newNotification);
    });

    // Listen for support reply notifications
    channel.bind('support.reply.created', (data: any) => {
      console.log('Received support.reply.created event:', data);
      const newNotification = data.notification;
      if (!newNotification) return;
      setNotifications(prev => {
        const exists = prev.some(n => n.notificationID === newNotification.notificationID);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
      console.log('New support reply notification added to state:', newNotification);
    });

    // Listen for booking requests (reschedule/cancellation) for admins
    channel.bind('booking.request.submitted', (data: any) => {
      console.log('Received booking.request.submitted event:', data);
      const newNotification = data.notification;
      setNotifications(prev => [newNotification, ...prev]);
      console.log('New booking request notification added to state:', newNotification);
    });

    return () => {
      console.log(`Unsubscribing from private-user.${userID}`);
      channel.unbind_all();
      pusher.unsubscribe(`private-user.${userID}`);
    };
  }, [userID]);

  return { notifications, setNotifications };
};