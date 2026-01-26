'use client';

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from 'next-auth/react';

// UI Components
import HeaderBar from "@/components/ui/HeaderBar";
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { ShopAdd, ShoppingBag } from "iconsax-reactjs";

// Assets & Libs
import imgIcon from '@/app/assets/imgs/img-icon.png';
import Pusher from 'pusher-js';
import { createClient } from '@supabase/supabase-js';
import { Message, RoomData } from "./roomType";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    // --- States ---
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmHint, setShowConfirmHint] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    // --- Refs ---
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Modals ---
    const sellerModal = useDisclosure(); // For the "Plus" icon action
    const buyerConfirmModal = useDisclosure(); // For the @confirm link action

    // --- Helpers ---
    const isSeller = session?.user?.id === room?.sellerId;
    const isBuyer = session?.user?.id === room?.buyerId;
    const canSend = isSeller || isBuyer;
    const hasConfirmationMessage = useMemo(() => messages.some(m => m.type === 'CONFIRM'), [messages]);

    /* ----------------------------- DATA FETCHING ----------------------------- */
    useEffect(() => {
        if (status !== "authenticated" || !roomId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [roomRes, msgRes] = await Promise.all([
                    fetch(`/api/rooms/${roomId}`, { credentials: "include" }),
                    fetch(`/api/messages?roomId=${roomId}`, { credentials: "include" })
                ]);

                if (!roomRes.ok || !msgRes.ok) throw new Error("Failed to fetch data");

                setRoom(await roomRes.json());
                setMessages(await msgRes.json());
            } catch (e) {
                setError("チャットの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId, status]);

    /* ----------------------------- PUSHER ----------------------------- */
    useEffect(() => {
        if (!room || !roomId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe(`room-${roomId}`);
        channel.bind('new-message', (newMessage: Message) => {
            setMessages(prev => prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [room, roomId]);

    /* ----------------------------- ACTIONS ----------------------------- */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setShowConfirmHint(message.trim().toLowerCase() === '@confirm');
    }, [message]);

    const sendMessage = async () => {
        if (!message.trim() || !session?.user?.id || !room || sendingMessage) return;

        const isConfirmCommand = message.trim().toLowerCase() === '@confirm';
        if (isConfirmCommand && !isSeller) {
            alert('確認リンクは販売者のみ送信できます');
            return;
        }

        const payload = {
            roomId,
            type: isConfirmCommand ? 'CONFIRM' : 'TEXT',
            content: isConfirmCommand ? '注文を確認する' : message.trim()
        };

        setSendingMessage(true);
        const tempId = `temp-${Date.now()}`;
        
        // Optimistic Update
        const optimisticMsg: any = { 
            id: tempId, ...payload, userId: session.user.id, 
            createdAt: new Date().toISOString(), user: { name: session.user.name },
            isOptimistic: true 
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setMessage("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const saved = await res.json();
            setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("送信に失敗しました");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !room) return;

        setUploading(true);
        try {
            const signRes = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: file.type, roomId })
            });
            const { signedUrl, path } = await signRes.json();
            await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
            
            const { data } = supabase.storage.from('chat-files').getPublicUrl(path);
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, type: 'IMAGE', fileUrl: data.publicUrl })
            });
        } catch (error) {
            alert("アップロードに失敗しました");
        } finally {
            setUploading(false);
        }
    };

    /* ----------------------------- RENDER ----------------------------- */
    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" /></div>;
    if (error || !room) return <div className="h-screen flex items-center justify-center"><p>{error || "Error loading room"}</p></div>;

    return (
        <div className={`flex flex-col h-screen ${(sellerModal.isOpen || buyerConfirmModal.isOpen) && 'bg-gray-100'}`}>
            <div className="px-4"><HeaderBar title={room.otherUser.name ?? "Chat"} /></div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex ${msg.userId === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] border border-text rounded-2xl py-2 px-4 
                            ${msg.userId === session?.user?.id ? 'bg-text text-white rounded-tr-none' : 'bg-white text-text rounded-tl-none'}
                            ${msg.type === 'IMAGE' ? 'p-0 border-none bg-transparent' : ''}
                            ${msg.isOptimistic ? 'opacity-50' : ''}`}>
                            
                            {msg.type === 'CONFIRM' ? (
                                <div className="p-2">
                                    {isBuyer ? (
                                        <button onClick={buyerConfirmModal.onOpen} className="bg-main text-white px-4 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                                            ✅ 注文内容を確認する
                                        </button>
                                    ) : (
                                        <div className="bg-gray-100 text-text px-4 py-2 rounded-lg italic text-sm">✅ 確認リンクを送信しました</div>
                                    )}
                                </div>
                            ) : msg.type === 'IMAGE' ? (
                                <Image src={msg.fileUrl!} alt="Chat" width={250} height={250} className="rounded-xl" />
                            ) : (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Hints */}
            {showConfirmHint && isSeller && (
                <div className="bg-gray-100 p-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-main" variant="Bulk" />
                        <div>
                            <p className="font-bold text-sm">注文確認リンクを作成</p>
                            <p className="text-xs text-gray-500">送信すると購入者が注文を確定できます</p>
                        </div>
                    </div>
                    <Button size="sm" className="bg-main text-white" onClick={sendMessage}>送信</Button>
                </div>
            )}

            {isBuyer && !hasConfirmationMessage && (
                <div className="bg-blue-50 py-2 text-center text-xs text-blue-600 border-t">
                    販売者が <b>@confirm</b> と入力すると注文確認へ進めます
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 pb-8 flex gap-2 items-center bg-white border-t">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? "..." : <Image width={28} height={28} alt="upload" src={imgIcon} />}
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                
                <input 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={isSeller ? "メッセージか @confirm を入力..." : "メッセージを入力..."}
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-main"
                />

                {isSeller && (
                    <button onClick={sellerModal.onOpen} className="text-main">
                        <ShopAdd size={32} variant="Bulk" />
                    </button>
                )}
            </div>

            {/* --- Modals --- */}
            
            {/* Buyer Confirmation Modal */}
            <Modal isOpen={buyerConfirmModal.isOpen} onOpenChange={buyerConfirmModal.onOpenChange} placement="center" backdrop="blur">
                <ModalContent className="rounded-2xl bg-white p-6">
                    <ModalBody className="text-center">
                        <div className="mx-auto bg-main/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag size={32} className="text-main" />
                        </div>
                        <h3 className="text-lg font-bold">注文内容の最終確認</h3>
                        <p className="text-gray-500 text-sm mt-2">商品の内容を確認し、決済・確定ページへ進みます。よろしいですか？</p>
                    </ModalBody>
                    <ModalFooter className="flex gap-2">
                        <Button variant="light" className="flex-1 border-text border" onClick={buyerConfirmModal.onClose}>戻る</Button>
                        <Button className="flex-1 bg-main text-white font-bold" onClick={() => router.push(`/confirm?roomId=${roomId}`)}>確定ページへ</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Seller "Done" Modal (Optional check for seller) */}
            <Modal isOpen={sellerModal.isOpen} onOpenChange={sellerModal.onOpenChange} placement="center">
                <ModalContent className="rounded-2xl p-6">
                    <ModalBody className="text-center"><p>作業を完了し、注文確認ページを確認しますか？</p></ModalBody>
                    <ModalFooter>
                        <Button variant="light" onClick={sellerModal.onClose}>いいえ</Button>
                        <Button className="bg-main text-white" onClick={() => router.push('/confirm')}>はい</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}