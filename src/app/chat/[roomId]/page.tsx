// app/chat/[roomId]/page.tsx - WITH POLLING FALLBACK
'use client';

import HeaderBar from "@/components/ui/HeaderBar";
import React, { useEffect, useRef, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { Message, RoomData } from "./roomType";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Toggle this to switch between realtime and polling
const USE_POLLING = true; // Set to false once realtime works

export default function Chat() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [realtimeStatus, setRealtimeStatus] = useState<string>("disconnected");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initializedRef = useRef(false);
    const pendingMessagesRef = useRef<Set<string>>(new Set());
    const lastMessageIdRef = useRef<string | null>(null);

    /* ----------------------------- INIT ----------------------------- */

    useEffect(() => {
        if (status === "loading") return;
        if (!roomId || initializedRef.current) return;

        initializedRef.current = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("📡 Fetching room data for:", roomId);

                // Fetch room data
                const roomRes = await fetch(`/api/rooms/${roomId}`, {
                    credentials: "include"
                });
                if (!roomRes.ok) {
                    if (roomRes.status === 404) {
                        setError("Chat room not found");
                        return;
                    }
                    if (roomRes.status === 403) {
                        setError("You don't have access to this chat");
                        return;
                    }
                    throw new Error(`Failed to fetch room: ${roomRes.status}`);
                }
                const roomData = await roomRes.json();
                console.log("✅ Room data loaded:", roomData.id);
                setRoom(roomData);

                // Fetch messages
                const messagesRes = await fetch(`/api/messages?roomId=${roomId}`, {
                    credentials: "include"
                });
                if (!messagesRes.ok) {
                    throw new Error(`Failed to fetch messages: ${messagesRes.status}`);
                }
                const messagesData = await messagesRes.json();
                console.log(`✅ Loaded ${messagesData.length} messages`);
                setMessages(messagesData);

                // Store last message ID
                if (messagesData.length > 0) {
                    lastMessageIdRef.current = messagesData[messagesData.length - 1].id;
                }
            } catch (error) {
                console.error("❌ Error fetching data:", error);
                setError("Failed to load chat. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId, status]);

    /* ------------------------- POLLING (FALLBACK) ------------------------- */

    useEffect(() => {
        if (!USE_POLLING || !roomId || !room) return;

        console.log("🔄 Using polling mode (checking every 2 seconds)");

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/messages?roomId=${roomId}`, {
                    credentials: "include"
                });

                if (!res.ok) return;

                const newMessages = await res.json();

                // Only update if there are new messages
                if (newMessages.length > messages.length) {
                    console.log(`📨 Polling found ${newMessages.length - messages.length} new messages`);
                    setMessages(newMessages);

                    // Update last message ID
                    if (newMessages.length > 0) {
                        lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 1000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [roomId, room, messages.length, USE_POLLING]);

    /* ------------------------- REALTIME (IF ENABLED) ------------------------- */

    useEffect(() => {
        if (USE_POLLING) return; // Skip if using polling
        if (!room || !session?.user?.id || !roomId) {
            console.log("⏸️ Skipping realtime setup - missing dependencies");
            return;
        }

        console.log("🔌 Setting up realtime for room:", roomId);

        const channel = supabase
            .channel(`room-${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                },
                (payload) => {
                    console.log("📨 Realtime message received:", payload);
                    const newMessage = payload.new as Message;

                    // Skip if this is our own message that we just sent
                    if (pendingMessagesRef.current.has(newMessage.id)) {
                        console.log("⏭️ Skipping own message:", newMessage.id);
                        pendingMessagesRef.current.delete(newMessage.id);
                        return;
                    }

                    setMessages(prev => {
                        // Check if message already exists
                        if (prev.some(m => m.id === newMessage.id)) {
                            console.log("⏭️ Message already exists:", newMessage.id);
                            return prev;
                        }

                        console.log("➕ Adding new message to state");
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
            .subscribe((status) => {
                console.log("📡 Realtime status:", status);
                setRealtimeStatus(status);
            });

        return () => {
            console.log("🔌 Cleaning up realtime subscription");
            supabase.removeChannel(channel);
        };
    }, [room, roomId, session?.user?.id, session?.user?.name, USE_POLLING]);

    /* ------------------------- SCROLL ------------------------- */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ------------------------- SEND TEXT ------------------------- */

    const sendMessage = async () => {
        if (!message.trim() || !session?.user?.id || !room) return;

        const tempId = `temp-${Date.now()}`;
        const content = message;

        console.log("📤 Sending message:", content);

        // Optimistic update
        setMessages(prev => [...prev, {
            id: tempId,
            content,
            userId: session.user.id,
            roomId,
            fileUrl: null,
            type: "TEXT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true,
            user: { name: session.user.name ?? "You" },
        }]);

        setMessage("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, content, type: "TEXT" })
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            const saved = await res.json();
            console.log("✅ Message saved:", saved.id);

            if (!USE_POLLING) {
                // Only mark as pending if using realtime
                pendingMessagesRef.current.add(saved.id);
                setTimeout(() => {
                    pendingMessagesRef.current.delete(saved.id);
                }, 2000);
            }

            // Replace temp message with real one
            setMessages(prev =>
                prev.map(m => m.id === tempId ? { ...saved, user: { name: session.user.name ?? "You" } } : m)
            );

        } catch (error) {
            console.error("❌ Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Failed to send message. Please try again.");
        }
    };

    /* ------------------------- IMAGE ------------------------- */

    const openFile = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !room || !session?.user?.id) return;

        console.log("📤 Uploading image:", file.name);
        setUploading(true);

        try {
            const res = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: file.type, roomId })
            });

            if (!res.ok) throw new Error("Failed to get upload URL");

            const { signedUrl, path } = await res.json();

            await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            });

            const { data } = supabase.storage
                .from('chat-files')
                .getPublicUrl(path);

            console.log("📤 Sending image message");

            const messageRes = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    type: 'IMAGE',
                    fileUrl: data.publicUrl
                })
            });

            if (!messageRes.ok) throw new Error("Failed to send image message");

            const saved = await messageRes.json();
            console.log("✅ Image message saved:", saved.id);

            if (!USE_POLLING) {
                // Only mark as pending if using realtime
                pendingMessagesRef.current.add(saved.id);
                setTimeout(() => {
                    pendingMessagesRef.current.delete(saved.id);
                }, 2000);
            }

        } catch (error) {
            console.error("❌ Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    /* ------------------------- RENDER ------------------------- */

    if (status === "loading" || loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>Loading chat...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!room || !session?.user?.id) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>Unable to load chat. Please try again.</p>
            </div>
        );
    }

    const canSend =
        room.buyerId === session.user.id ||
        room.sellerId === session.user.id;

    const isSender = (m: Message) => m.userId === session.user.id;

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen">

            <div className="px-4">
                <HeaderBar title={room.otherUser.name ?? "Chat"} />
            </div>

            {/* Status Indicator */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 px-4 py-1 text-xs text-gray-600 border-b">
                    {USE_POLLING ? (
                        <span className="text-blue-600">Mode: Polling (every 2s)</span>
                    ) : (
                        <span>
                            Realtime: <span className={realtimeStatus === 'SUBSCRIBED' ? 'text-green-600' : 'text-red-600'}>
                                {realtimeStatus}
                            </span>
                        </span>
                    )}
                </div>
            )} */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${isSender(msg) ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg p-3 max-w-[70%] ${msg.type === 'IMAGE' && 'border-none p-0'} ${isSender(msg) && 'border rounded-xl'
                                } ${msg.isOptimistic ? 'opacity-60' : ''}`}>
                                {msg.type === 'IMAGE' && msg.fileUrl ? (
                                    <div className="mt-2">
                                        <Image
                                            src={msg.fileUrl}
                                            alt="Uploaded image"
                                            width={200}
                                            height={200}
                                            className="rounded"
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                        />
                                    </div>
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                                <p className="text-xs mt-1 opacity-75">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pb-10 flex gap-2">
                <button
                    onClick={openFile}
                    disabled={uploading || !canSend}
                    className="px-3 py-2 bg-main rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    {uploading ? '📤' :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    }
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!canSend}
                    className="flex-1 border rounded-xl px-3 py-2 disabled:opacity-50"
                />
                <button
                    onClick={sendMessage}
                    disabled={!message.trim() || !canSend}
                    className="px-4 py-2 bg-text text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    送信
                </button>
            </div>
        </div>
    );
}