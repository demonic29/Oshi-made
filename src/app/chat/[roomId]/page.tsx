// app/chat/[roomId]/page.tsx - WITH PUSHER REALTIME
'use client';

import HeaderBar from "@/components/ui/HeaderBar";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { Message, RoomData } from "./roomType";
import { useParams, useRouter } from "next/navigation";
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import imgIcon from '@/app/assets/imgs/img-icon.png';
import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const [pusherConnected, setPusherConnected] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pendingMessagesRef = useRef<Set<string>>(new Set());

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    /* ----------------------------- INIT ----------------------------- */
    useEffect(() => {
        if (status !== "authenticated") return;
        if (!roomId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const roomRes = await fetch(`/api/rooms/${roomId}`, {
                    credentials: "include",
                });
                if (!roomRes.ok) throw new Error("Room fetch failed");
                const roomData = await roomRes.json();
                setRoom(roomData);

                const messagesRes = await fetch(`/api/messages?roomId=${roomId}`, {
                    credentials: "include",
                });
                if (!messagesRes.ok) throw new Error("Messages fetch failed");
                const messagesData = await messagesRes.json();
                setMessages(messagesData);
            } catch (e) {
                setError("Failed to load chat");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId, status]);

    /* ----------------------------- PUSHER REALTIME ----------------------------- */
    useEffect(() => {
        if (!room || !session?.user?.id || !roomId) return;

        console.log("🚀 Setting up Pusher for room:", roomId);

        // Initialize Pusher
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        // Monitor connection status
        pusher.connection.bind('connected', () => {
            console.log("✅ Pusher connected");
            setPusherConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
            console.log("❌ Pusher disconnected");
            setPusherConnected(false);
        });

        pusher.connection.bind('error', (err: any) => {
            console.error("❌ Pusher error:", err);
            setPusherConnected(false);
        });

        // Subscribe to room channel
        const channel = pusher.subscribe(`room-${roomId}`);

        // Listen for new messages
        channel.bind('new-message', (newMessage: Message) => {
            setMessages(prev => {
                // Already exists? Do nothing
                if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                }

                return [...prev, newMessage];
            });
        });


        // Cleanup
        return () => {
            console.log("🔌 Cleaning up Pusher subscription");
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [room, roomId, session?.user?.id, session?.user?.name]);

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
        const optimisticMessage = {
            id: tempId,
            content,
            userId: session.user.id,
            roomId,
            fileUrl: null,
            type: "TEXT" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true,
            user: { name: session.user.name ?? "You" },
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessage("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, content, type: "TEXT" })
            });

            if (!res.ok) throw new Error("Failed to send message");

            const saved = await res.json();
            console.log("✅ Message saved:", saved.id);

            // Mark as pending so we don't duplicate when Pusher event arrives
            pendingMessagesRef.current.add(saved.id);

            // Replace temp message with real one
            setMessages(prev =>
                prev.filter( m => m.id !== tempId )
            );

            // Clear pending after delay
            setTimeout(() => {
                pendingMessagesRef.current.delete(saved.id);
            }, 2000);

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

            const { data } = supabase.storage.from('chat-files').getPublicUrl(path);

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

            // Mark as pending to avoid duplication
            pendingMessagesRef.current.add(saved.id);
            setTimeout(() => {
                pendingMessagesRef.current.delete(saved.id);
            }, 2000);

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
            <div className='flex items-center justify-center py-12 h-screen'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => router.back()} className="px-4 py-2 bg-blue-500 text-white rounded">
                    戻る
                </button>
            </div>
        );
    }

    if (!room || !session?.user?.id) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>チャットを読み込めませんでした。もう一度お試しください。</p>
            </div>
        );
    }

    const canSend = room.buyerId === session.user.id || room.sellerId === session.user.id;
    const isSender = (m: Message) => m.userId === session.user.id;
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const isSeller = session.user.id === room.sellerId;

    return (
        <div className={`${isOpen && 'bg-text opacity-50'} flex flex-col h-screen`}>
            <div className="px-4">
                <HeaderBar title={room.otherUser.name ?? "Chat"} />
            </div>

            {/* Pusher Status Indicator (dev only) */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 px-4 py-1 text-xs text-gray-600 border-b">
                    Pusher: <span className={pusherConnected ? 'text-green-600' : 'text-red-600'}>
                        {pusherConnected ? '✅ Connected (Real-time)' : '❌ Disconnected'}
                    </span>
                </div>
            )} */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">オーダーを始めよう！</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${isSender(msg) ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[70%] border border-text
                                ${msg.type === 'IMAGE' ? 'p-0 border-none' : 'py-1 px-5'}
                                ${isSender(msg) ? 'rounded-t-2xl rounded-l-xl' : 'rounded-t-2xl rounded-r-xl'}
                                ${msg.isOptimistic ? 'opacity-60' : ''}
                            `}>
                                {msg.type === 'IMAGE' && msg.fileUrl ? (
                                    <div className="mt-2">
                                        <Image
                                            src={msg.fileUrl}
                                            alt="Uploaded image"
                                            width={240}
                                            height={240}
                                            className="rounded"
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                        />
                                    </div>
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pb-10 flex gap-2">
                <button onClick={openFile} disabled={uploading || !canSend}>
                    {uploading ? '📤' : <Image width={30} height={30} alt="image-icon" src={imgIcon} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

                <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="テキスト入力。。。"
                    disabled={!canSend}
                    className="flex-1 border rounded-t-xl py-1 rounded-l-xl ms-2 px-3 disabled:opacity-50"
                />

                {isSeller && (
                    <Button onClick={onOpen} className="px-4 py-2 text-text rounded hover:bg-blue-600 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>

                        <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                            <ModalContent className="bg-white p-10 mx-auto max-h-[40%] max-w-[85%] rounded-lg shadow">
                                {(onClose) => (
                                    <>
                                        <ModalBody>
                                            <p className="text-center">完成でよろしいですか？</p>
                                        </ModalBody>
                                        <ModalFooter className="max-w-fit flex justify-center space-x-8">
                                            <Button className="bg-accent px-8 py-5 shadow-lg" variant="default" onClick={onClose}>
                                                いいえ
                                            </Button>
                                            <Button onClick={() => router.push('/confirm')} className="bg-main px-8 py-5 shadow-lg">
                                                はい
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </Button>
                )}
            </div>
        </div>
    );
}