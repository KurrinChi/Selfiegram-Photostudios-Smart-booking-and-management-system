import Pusher from 'pusher-js';

// Enable Pusher logging for debugging
Pusher.logToConsole = true;

// Create Pusher instance with proper authentication
const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || '9e0e3462ef1544aa75f8', {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
  forceTLS: true,
  authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
  auth: {
    headers: {
      get Authorization() {
        const token = localStorage.getItem('token');
        console.log('Getting auth token for Pusher:', token ? `${token.substring(0, 10)}...` : 'null');
        return token ? `Bearer ${token}` : '';
      },
    },
  },
});

// Connection event listeners for debugging
pusher.connection.bind('connected', () => {
  console.log('Pusher connected successfully');
});

pusher.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
});

pusher.connection.bind('disconnected', () => {
  console.log('Pusher disconnected');
});

pusher.connection.bind('state_change', (states: any) => {
  console.log('3Pusher state change:', states);
});

export default pusher;