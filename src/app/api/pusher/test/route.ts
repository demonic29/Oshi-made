// app/api/pusher/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();
        
        await pusher.trigger('test-channel', 'test-event', {
            message,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Pusher test error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}