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

    // Track optimistic messages to prevent duplicates
    const optimisticIdRef = useRef<string>('');
    const pendingMessagesRef = useRef<Set<string>>(new Set());

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
                    table: 'Message',
                    filter: `roomId=eq.${roomId}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    // If we already received this message from our POST response,
                    // it will be in the pending set — ignore the realtime event.
                    if (pendingMessagesRef.current.has(newMessage.id)) {
                        pendingMessagesRef.current.delete(newMessage.id);
                        return;
                    }

                    setMessages(prev => {
                        // Remove any optimistic placeholder
                        const filtered = prev.filter(msg => !msg.isOptimistic);

                        // Prevent duplicates
                        const exists = filtered.some(msg => msg.id === newMessage.id);
                        if (exists) return filtered;

                        return [...filtered, {
                            ...newMessage,
                            user: {
                                name:
                                    newMessage.userId === session?.user?.id
                                        ? session?.user?.name ?? 'You'
                                        : room?.otherUser.name ?? 'Unknown',
                            }

                        }];
                    });
                }
            )
            .subscribe();

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

    const sendMessage = async () => {
        if (!message.trim()) return;

        const messageContent = message;
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create optimistic message
        const optimisticMessage: Message = {
            id: tempId,
            content: messageContent,
            userId: session?.user?.id!,
            roomId,
            type: 'TEXT',
            fileUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true, // Flag to identify optimistic messages
            user: {
                name: session?.user?.name ?? 'You',
            }
        };

        // Add optimistic message immediately
        setMessages(prev => [...prev, optimisticMessage]);
        optimisticIdRef.current = tempId;
        setMessage(""); // Clear input

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

            const result = await response.json();

            // Add the real message ID to pending set and replace optimistic message
            if (result.id) {
                pendingMessagesRef.current.add(result.id);

                // Replace optimistic message with real message returned from server
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId
                        ? { ...result, isOptimistic: false, user: { name: session?.user?.name ?? 'You' } }
                        : msg
                ));

                // Clear optimistic id
                if (optimisticIdRef.current === tempId) optimisticIdRef.current = '';
            }

        } catch (error) {
            console.error('Error sending message:', error);

            // Revert optimistic update on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));

            // Show error to user
            alert('Failed to send message. Please try again.');

            // Restore the message content if needed
            // setMessage(messageContent); // Optional: restore message
        }
    };

    const sendImageMessage = async (fileUrl: string) => {
        const tempId = `temp-img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create optimistic message for image
        const optimisticMessage: Message = {
            id: tempId,
            content: '', // Image messages might not have text content
            userId: session?.user?.id!,
            roomId,
            type: 'IMAGE',
            fileUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true,
            user: {
                name: session?.user?.name ?? 'You',
            }
        };

        // Add optimistic message immediately
        setMessages(prev => [...prev, optimisticMessage]);
        optimisticIdRef.current = tempId;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: roomId,
                    type: 'IMAGE',
                    fileUrl: fileUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send image');
            }

            const result = await response.json();

            // Add the real message ID to pending set and replace optimistic image
            if (result.id) {
                pendingMessagesRef.current.add(result.id);

                setMessages(prev => prev.map(msg =>
                    msg.id === tempId
                        ? { ...result, isOptimistic: false, user: { name: session?.user?.name ?? 'You' } }
                        : msg
                ));

                if (optimisticIdRef.current === tempId) optimisticIdRef.current = '';
            }

        } catch (error) {
            console.error('Error sending image:', error);

            // Revert optimistic update on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));

            alert('Failed to send image');
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

    // Add this function to generate signed upload URL
    const getSignedUploadUrl = async (fileName: string, fileType: string) => {
        try {
            const response = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName,
                    fileType,
                    roomId
                })
            });

            if (!response.ok) throw new Error('Failed to get signed URL');
            return await response.json();
        } catch (error) {
            console.error('Error getting signed URL:', error);
            throw error;
        }
    };

    const canSend = room && (room.buyerId === session?.user?.id ||room.sellerId === session?.user?.id);


    // Then update your handleFileChange function:
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setUploading(true);

        try {
            // Get signed URL from your API
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

            const { signedUrl, path } = await getSignedUploadUrl(fileName, file.type);

            // Upload directly to Supabase Storage using signed URL
            const uploadResponse = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-files')
                .getPublicUrl(path);

            // Send optimistic image message
            await sendImageMessage(publicUrl);

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
                    title={room ? room.otherUser.name ?? "Chat" : "Loading..."}
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
                                        <div className="flex items-center gap-2 mb-1">
                                            <Image
                                                src={room?.otherUser.image ?? "/avatar.png"}
                                                alt="User avatar"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                            <p className="text-xs text-gray-600">
                                                {room?.otherUser.name}
                                            </p>
                                        </div>
                                    )}

                                    <div className={`rounded-lg p-3 ${isSender(msg)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-black'
                                        } ${msg.isOptimistic ? 'opacity-80' : ''}`}>
                                        {msg.type === 'IMAGE' && msg.fileUrl && (
                                            <div className="relative">
                                                <Image
                                                    src={msg.fileUrl}
                                                    alt="Shared image"
                                                    width={300}
                                                    height={300}
                                                    className="rounded max-w-full h-auto mb-2"
                                                />
                                                {msg.isOptimistic && (
                                                    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                                                        <i className="fa-solid fa-spinner fa-spin text-xl text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {msg.content && (
                                            <p className="text-sm whitespace-pre-wrap">
                                                {msg.content}
                                                {msg.isOptimistic && (
                                                    <i className="fa-solid fa-spinner fa-spin ml-2 text-xs" />
                                                )}
                                            </p>
                                        )}
                                        <p className={`text-xs mt-1 ${isSender(msg) ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {msg.isOptimistic && ' • Sending...'}
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