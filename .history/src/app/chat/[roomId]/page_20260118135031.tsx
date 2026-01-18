// app/chat/[roomId]/page.tsx
'use client';

import HeaderBar from "@/components/ui/HeaderBar";
import React, { useEffect, useRef, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { Message, RoomData } from "./roomType";
import { useParams } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
    const { data: session, status } = useSession();
    const params = useParams();
    const roomId = params.roomId as string;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initializedRef = useRef(false);
    const pendingMessagesRef = useRef<Set<string>>(new Set());

    /* ----------------------------- INIT ----------------------------- */

    useEffect(() => {
        if (status !== "authenticated") return;
        if (initializedRef.current) return;

        initializedRef.current = true;
        fetchRoomData();
        fetchMessages();
    }, [roomId, status]);

    /* ------------------------- REALTIME ------------------------- */

    useEffect(() => {
        if (!room || !session?.user?.id) return;

        const channel = supabase
            .channel(`room-${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                    filter: `roomId=eq.${roomId}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    if (pendingMessagesRef.current.has(newMessage.id)) {
                        pendingMessagesRef.current.delete(newMessage.id);
                        return;
                    }

                    setMessages(prev => {
                        if (prev.some(m => m.id === newMessage.id)) return prev;

                        return [...prev, {
                            ...newMessage,
                            user: {
                                name:
                                    newMessage.userId === session.user.id
                                        ? session.user.name ?? "You"
                                        : room.otherUser.name ?? "Unknown",
                            }
                        }];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room, roomId, session?.user?.id]);

    /* ------------------------- SCROLL ------------------------- */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ------------------------- FETCH ------------------------- */

    const fetchRoomData = async () => {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!res.ok) return;
        const data = await res.json();
        setRoom(data);
    };

    const fetchMessages = async () => {
        const res = await fetch(`/api/messages?roomId=${roomId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data);
    };

    /* ------------------------- SEND TEXT ------------------------- */

    const sendMessage = async () => {
        if (!message.trim() || !session?.user?.id || !room) return;

        const tempId = `temp-${Date.now()}`;
        const content = message;

        setMessages(prev => [...prev, {
            id: tempId,
            content,
            userId: session.user.id,
            roomId,
            type: "TEXT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true,
            user: { name: session.user.name ?? "You" }
        }]);

        setMessage("");

        const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, content, type: "TEXT" })
        });

        if (!res.ok) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            return;
        }

        const saved = await res.json();
        pendingMessagesRef.current.add(saved.id);

        setMessages(prev =>
            prev.map(m => m.id === tempId ? saved : m)
        );
    };

    /* ------------------------- IMAGE ------------------------- */

    const openFile = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !room || !session?.user?.id) return;

        setUploading(true);

        try {
            const res = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: file.type, roomId })
            });

            const { signedUrl, path } = await res.json();

            await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            });

            const { data } = supabase.storage
                .from('chat-files')
                .getPublicUrl(path);

            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    type: 'IMAGE',
                    fileUrl: data.publicUrl
                })
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    /* ------------------------- RENDER ------------------------- */

    if (!room) return null;

    const canSend =
        room.buyerId === session?.user?.id ||
        room.sellerId === session?.user?.id;

    const isSender = (m: Message) => m.userId === session?.user?.id;

    return (
        <div className="flex flex-col h-screen">
            <HeaderBar title={room.otherUser.name ?? "Chat"} />

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${isSender(msg) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg p-3 max-w-[70%] ${isSender(msg) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 flex gap-2">
                <button onClick={openFile} disabled={uploading}>📷</button>
                <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
                <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="flex-1 border rounded px-3"
                />
                <button onClick={sendMessage} disabled={!canSend}>Send</button>
            </div>
        </div>
    );
}
