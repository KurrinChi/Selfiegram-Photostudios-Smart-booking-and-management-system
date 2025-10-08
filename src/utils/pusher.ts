import Pusher from 'pusher-js';

// Create Pusher instance with proper authentication
const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || '9e0e3462ef1544aa75f8', {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
  forceTLS: true,
  authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
  auth: {
    headers: {
      get Authorization() {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : '';
      },
    },
  },
});


export default pusher;