import { useEffect, useState } from 'react';
import pusher from '../utils/pusher';

interface Notification {
  notificationID: number;
  userID: number | null;
  title: string;
  label?: "Booking" | "Payment" | "Reschedule" | "Cancellation" | "Reminder" | "Promotion" | "System" | "Gallery";
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

    return () => {
      console.log(`Unsubscribing from private-user.${userID}`);
      channel.unbind_all();
      pusher.unsubscribe(`private-user.${userID}`);
    };
  }, [userID]);

  return { notifications, setNotifications };
};