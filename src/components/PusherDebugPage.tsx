import { useEffect, useState } from 'react';
import pusher from '../utils/pusher';

const PusherDebugPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [subscriptionStatus, setSubscriptionStatus] = useState('Not subscribed');
  const [messages, setMessages] = useState<string[]>([]);
  const [userID, setUserID] = useState<string>('');

  const addMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  useEffect(() => {
    // Connection event listeners
    pusher.connection.bind('connected', () => {
      setConnectionStatus('Connected');
      addMessage('✅ Pusher connected successfully');
    });

    pusher.connection.bind('error', (err: any) => {
      setConnectionStatus('Error');
      addMessage(`❌ Pusher connection error: ${JSON.stringify(err)}`);
    });

    pusher.connection.bind('disconnected', () => {
      setConnectionStatus('Disconnected');
      addMessage('⚠️ Pusher disconnected');
    });

    // Get userID from localStorage
    const storedUserID = localStorage.getItem('userID');
    if (storedUserID) {
      setUserID(storedUserID);
    }

    return () => {
      pusher.connection.unbind_all();
    };
  }, []);

  const testSubscription = () => {
    if (!userID) {
      addMessage('❌ No userID provided');
      return;
    }

    addMessage(`🔄 Attempting to subscribe to private-user.${userID}`);
    
    const channel = pusher.subscribe(`private-user.${userID}`);

    channel.bind('pusher:subscription_succeeded', () => {
      setSubscriptionStatus('Subscribed');
      addMessage(`✅ Successfully subscribed to private-user.${userID}`);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      setSubscriptionStatus('Failed');
      addMessage(`❌ Subscription failed: ${JSON.stringify(error)}`);
    });

    channel.bind('gallery.images.confirmed', (data: any) => {
      addMessage(`📨 Received gallery.images.confirmed: ${JSON.stringify(data)}`);
    });
  };

  const testApiStatus = async () => {
    addMessage('🔄 Testing API server status...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api-status`);
      const data = await response.json();
      addMessage(`✅ API Status: ${JSON.stringify(data)}`);
    } catch (error) {
      addMessage(`❌ API Status error: ${error}`);
    }
  };

  const testPusherEndpoint = async () => {
    addMessage('🔄 Testing Pusher endpoint...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test-pusher`);
      const data = await response.json();
      addMessage(`✅ Test endpoint response: ${JSON.stringify(data)}`);
    } catch (error) {
      addMessage(`❌ Test endpoint error: ${error}`);
    }
  };

  const testPublicPusher = async () => {
    addMessage('🔄 Testing public Pusher endpoint...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test-pusher-public`);
      const data = await response.json();
      addMessage(`✅ Public test response: ${JSON.stringify(data)}`);
    } catch (error) {
      addMessage(`❌ Public test error: ${error}`);
    }
  };

  const testPublicChannel = () => {
    addMessage('🔄 Subscribing to public test channel...');
    const channel = pusher.subscribe('test-channel');
    
    channel.bind('test-event', (data: any) => {
      addMessage(`📨 Received public test event: ${JSON.stringify(data)}`);
    });
    
    addMessage('✅ Subscribed to test-channel');
  };

  const testAuthEndpoint = async () => {
    addMessage('🔄 Testing auth endpoint...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/broadcasting/auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `socket_id=test&channel_name=private-user.${userID}`
      });
      const data = await response.json();
      addMessage(`✅ Auth endpoint response: ${JSON.stringify(data)}`);
    } catch (error) {
      addMessage(`❌ Auth endpoint error: ${error}`);
    }
  };

  const testLogEndpoint = async () => {
    addMessage('🔄 Testing logs endpoint...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/test-logs`);
      const data = await response.json();
      addMessage(`✅ Logs test response: ${JSON.stringify(data)}`);
    } catch (error) {
      addMessage(`❌ Logs test error: ${error}`);
    }
  };

  const testUserAuth = async () => {
    addMessage('🔄 Testing user auth...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/test-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      addMessage(`✅ User auth response: ${JSON.stringify(data)}`);
    } catch (error) {
      addMessage(`❌ User auth error: ${error}`);
    }
  };

  const testSimpleSubscription = () => {
    addMessage('🔄 Testing simple private channel subscription...');
    
    // Make sure we have userID
    if (!userID) {
      addMessage('❌ No userID provided');
      return;
    }

    const channelName = `private-user.${userID}`;
    addMessage(`📡 Attempting to subscribe to: ${channelName}`);
    
    try {
      const channel = pusher.subscribe(channelName);
      
      // Bind to subscription events
      channel.bind('pusher:subscription_succeeded', (data: any) => {
        addMessage(`✅ Successfully subscribed to ${channelName}`);
        addMessage(`📊 Subscription data: ${JSON.stringify(data)}`);
      });

      channel.bind('pusher:subscription_error', (error: any) => {
        addMessage(`❌ Subscription failed for ${channelName}: ${JSON.stringify(error)}`);
      });

      // Bind to our custom event
      channel.bind('gallery.images.confirmed', (data: any) => {
        addMessage(`📨 Received gallery.images.confirmed: ${JSON.stringify(data)}`);
      });

      addMessage(`🎯 Channel subscription initiated for ${channelName}`);
      
    } catch (error) {
      addMessage(`❌ Error during subscription: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pusher Debug Console</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <span className={`px-2 py-1 rounded text-sm ${
            connectionStatus === 'Connected' ? 'bg-green-200 text-green-800' :
            connectionStatus === 'Error' ? 'bg-red-200 text-red-800' :
            'bg-gray-200 text-gray-800'
          }`}>
            {connectionStatus}
          </span>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Subscription Status</h3>
          <span className={`px-2 py-1 rounded text-sm ${
            subscriptionStatus === 'Subscribed' ? 'bg-green-200 text-green-800' :
            subscriptionStatus === 'Failed' ? 'bg-red-200 text-red-800' :
            'bg-gray-200 text-gray-800'
          }`}>
            {subscriptionStatus}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">User ID</h3>
        <input
          type="text"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Enter user ID"
        />
      </div>

      <div className="space-x-2 mb-6">
        <button
          onClick={testApiStatus}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Test API Status
        </button>
        <button
          onClick={testUserAuth}
          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
        >
          Test User Auth
        </button>
        <button
          onClick={testSubscription}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Private Channel
        </button>
        <button
          onClick={testPublicChannel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Public Channel
        </button>
        <button
          onClick={testPusherEndpoint}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Private Broadcast
        </button>
        <button
          onClick={testPublicPusher}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Test Public Broadcast
        </button>
        <button
          onClick={testAuthEndpoint}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Auth Endpoint
        </button>
        <button
          onClick={testSimpleSubscription}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Test Simple Subscription
        </button>
        <button
          onClick={() => setMessages([])}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Messages
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        <h3 className="text-white mb-2">Debug Messages:</h3>
        {messages.map((message, index) => (
          <div key={index} className="mb-1">{message}</div>
        ))}
        {messages.length === 0 && (
          <div className="text-gray-500">No messages yet...</div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Configuration:</h4>
        <ul className="space-y-1">
          <li>Pusher App Key: {import.meta.env.VITE_PUSHER_APP_KEY}</li>
          <li>Pusher Cluster: {import.meta.env.VITE_PUSHER_APP_CLUSTER}</li>
          <li>API URL: {import.meta.env.VITE_API_URL}</li>
          <li>Auth Token: {localStorage.getItem('token') ? `Present (${localStorage.getItem('token')?.substring(0, 20)}...)` : 'Missing'}</li>
          <li>User ID: {localStorage.getItem('userID') || 'Missing'}</li>
          <li>Username: {localStorage.getItem('username') || 'Missing'}</li>
        </ul>
      </div>
    </div>
  );
};

export default PusherDebugPage;