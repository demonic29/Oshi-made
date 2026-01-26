// lib/pusher.ts
import Pusher from 'pusher';

export const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

// Helper function to trigger message events
export async function triggerNewMessage(roomId: string, message: any) {
    await pusher.trigger(`room-${roomId}`, 'new-message', message);
}