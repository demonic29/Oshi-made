// components/RealtimeTest.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RealtimeTest() {
    const [status, setStatus] = useState('disconnected');
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const channel = supabase
            .channel('test-channel')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events
                    schema: 'public',
                    table: 'Message'
                },
                (payload) => {
                    console.log('Realtime event:', payload);
                    setEvents(prev => [...prev, payload]);
                }
            )
            .subscribe((status) => {
                console.log('Status:', status);
                setStatus(status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Realtime Test</h3>
            <p>Status: <span className={status === 'SUBSCRIBED' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
            <div className="mt-2">
                <p className="font-semibold">Events received: {events.length}</p>
                {events.map((event, i) => (
                    <pre key={i} className="text-xs bg-white p-2 mt-1 overflow-auto">
                        {JSON.stringify(event, null, 2)}
                    </pre>
                ))}
            </div>
        </div>
    );
}