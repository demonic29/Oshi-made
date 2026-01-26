'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export default function TestPusher() {
    const [status, setStatus] = useState('Connecting...');
    const [events, setEvents] = useState<string[]>([]);

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        pusher.connection.bind('connected', () => {
            setStatus('✅ Connected to Pusher!');
        });

        pusher.connection.bind('error', (err: any) => {
            setStatus('❌ Error: ' + err.message);
        });

        const channel = pusher.subscribe('test-channel');
        
        channel.bind('test-event', (data: any) => {
            setEvents(prev => [...prev, JSON.stringify(data)]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    const sendTestEvent = async () => {
        await fetch('/api/pusher/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello from frontend!' })
        });
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Pusher Test</h1>
            <p className="mb-4">Status: {status}</p>
            
            <button 
                onClick={sendTestEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
            >
                Send Test Event
            </button>

            <div>
                <h2 className="font-bold mb-2">Received Events:</h2>
                {events.map((event, i) => (
                    <div key={i} className="p-2 bg-gray-100 mb-2 rounded">
                        {event}
                    </div>
                ))}
            </div>
        </div>
    );
}