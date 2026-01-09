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
    const { data: session } = useSession();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const params = useParams();
    const roomId = params.roomId as string;

    useEffect(() => {
        fetchRoomData();
        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`room-${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'message',
                    filter: `roomId=eq.${roomId}`
                },
                async (payload) => {
                    console.log('New message received:', payload);
                    // Fetch the complete message with user data
                    await fetchNewMessage(payload.new.id);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchRoomData = async () => {
        try {
            const response = await fetch(`/api/rooms/${roomId}`);
            if (!response.ok) throw new Error('Failed to fetch room');
            const data = await response.json();
            setRoom(data);
        } catch (error) {
            console.error('Error fetching room:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages?roomId=${roomId}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchNewMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/messages/${messageId}`);
            if (!response.ok) throw new Error('Failed to fetch message');
            const data = await response.json();
            
            // Only add if not already in messages (prevent duplicates)
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === data.id);
                if (exists) return prev;
                return [...prev, data];
            });
        } catch (error) {
            console.error('Error fetching new message:', error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        const messageContent = message;
        setMessage(""); // Clear input immediately for better UX

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: messageContent,
                    roomId,
                    type: 'TEXT'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Message will appear via Supabase real-time subscription
        } catch (error) {
            console.error('Error sending message:', error);
            setMessage(messageContent); // Restore message on error
            alert('Failed to send message. Please try again.');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const openFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setUploading(true);

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
            const filePath = `chat-images/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath);

            // Send message with image
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: roomId,
                    type: 'IMAGE',
                    fileUrl: publicUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send image');
            }

            // Message will appear via Supabase real-time subscription
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const isSender = (msg: Message) => msg.userId === session?.user?.id;

    return (
        <div className="flex flex-col h-screen">
            <div className="px-4">
                <HeaderBar
                    title={room ? `Chat about ${room.product.name}` : "Loading..."}
                />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${isSender(msg) ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] ${msg.type === 'SYSTEM'
                            ? 'w-full text-center'
                            : ''
                            }`}>
                            {msg.type === 'SYSTEM' ? (
                                <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                                    {msg.content}
                                </div>
                            ) : (
                                <>
                                    {!isSender(msg) && (
                                        <p className="text-xs text-gray-600 mb-1">
                                            {msg.user?.name || 'Unknown User'}
                                        </p>
                                    )}
                                    <div className={`rounded-lg p-3 ${isSender(msg)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-black'
                                        }`}>
                                        {msg.type === 'IMAGE' && msg.fileUrl && (
                                            <Image
                                                src={msg.fileUrl}
                                                alt="Shared image"
                                                width={300}
                                                height={300}
                                                className="rounded max-w-full h-auto mb-2"
                                            />
                                        )}
                                        {msg.content && (
                                            <p className="text-sm whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                        )}
                                        <p className={`text-xs mt-1 ${isSender(msg) ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-white">
                <div className="flex items-center gap-2">
                    <button
                        onClick={openFile}
                        disabled={uploading}
                        className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                    >
                        {uploading ? (
                            <i className="fa-solid fa-spinner fa-spin text-xl text-gray-600" />
                        ) : (
                            <i className="fa-solid fa-image text-xl text-gray-600" />
                        )}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />

                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={uploading}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!message.trim() || uploading}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-paper-plane" />
                    </button>
                </div>
            </div>
        </div>
    );
}