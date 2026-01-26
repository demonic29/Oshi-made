'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import HeaderBar from '@/components/ui/HeaderBar';
import BottomTabs from '@/components/ui/BottomTabs';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        images: string[];
    };
}

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function CartPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!session?.user) return;
            try {
                const response = await fetch('/api/order');
                const data = await response.json();
                setOrders(data.orders || []);
            } catch (err) {
                console.error("Failed to load orders");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [session]);

    if (isLoading) return <div className="flex items-center justify-center h-screen">読み込み中...</div>;

    return (
        <div className="pb-32">
            <div className='px-4'>
                <HeaderBar title='カート' />
            </div>

            <div className='px-8 mt-8 space-y-10'>
                <h3 className='text-xl font-bold text-text'>注文履歴</h3>
                
                {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">カートは空です</p>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="border-b border-gray-300 pb-6">                           
                            {/* Order Items - Fetching Product Data here */}
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div className='flex gap-4' key={item.id}>
                                        <div className='relative w-20 h-20 flex-shrink-0'>
                                            <Image
                                                src={item.product.images?.[0] || '/placeholder.png'}
                                                alt={item.product.name}
                                                fill
                                                className='object-cover rounded-lg'
                                            />
                                        </div>
                                        <div className='flex flex-col justify-center'>
                                            <p className='font-bold text-sm'>{item.product.name}</p>
                                            <p className='text-xs text-gray-500'>数量: {item.quantity}</p>
                                            <p className='text-main font-bold mt-1'>¥{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))
                )}
            </div>

            {orders.length > 0 && (
                <div className="fixed bottom-24 w-[50%] mx-auto left-0 right-0 px-8">
                    <Link
                        href="/cart/cart-user-info"
                        className="block bg-main text-white py-2 rounded-md text-center font-bold"
                    >
                        注文に進む
                    </Link>
                </div>
            )}

            <BottomTabs />
        </div>
    );
}