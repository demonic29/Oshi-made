'use client';

import Image from 'next/image';
import HeaderBar from '@/components/ui/HeaderBar';
import Link from 'next/link';
import BottomTabs from '@/components/ui/BottomTabs';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        images: string[];
        description: string;
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const { data: session } = useSession();
    const router = useRouter();

    const isBuyer = session?.user?.role === 'BUYER';
    const isSeller = session?.user?.role === 'SELLER';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/orders');

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders || []);
            } catch (err) {
                // console.error('Error fetching orders:', err);
                // setError('Failed to load orders');
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchOrders();
        }
    }, [session]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
    }

    // if (!isBuyer) {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //             <p>あなたは購入者ではありません。</p>
    //         </div>
    //     );
    // }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    // Check if user has phone verified
    // const hasPhoneVerified = session?.user?.phone;

    // if (!hasPhoneVerified) {
    //     router.push('/auth/login');
    //     return null;
    // }

    return (
        <div>
            <div className='px-4'>
                <HeaderBar title='カート' />
            </div>

            <div className='px-8 mt-8'>
                <h3 className='text-text'>注文履歴</h3>
                {orders.length === 0 ? (
                    <p className="text-center text-gray-500">カートは空です</p>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">注文 #{order.id.slice(0, 8)}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'phone_verified' ? 'bg-green-100 text-green-800' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            {order.items.map((item) => (
                                <div className='flex gap-4 pb-4 border-gray-300 border-b mb-4' key={item.id}>
                                    <div className='relative w-[100px] h-[100px]'>
                                        <Image
                                            src={item.product.images[0] || '/placeholder.png'}
                                            alt={item.product.name}
                                            fill
                                            className='object-cover rounded'
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <p className='font-medium'>{item.product.name}</p>
                                        <p className='text-sm text-gray-600'>数量: {item.quantity}</p>
                                        <p className='text-sm font-semibold mt-2'>¥{item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}

                            <div className='flex justify-between items-center mt-4 font-bold'>
                                <span>合計</span>
                                <span>¥{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className='px-8 mt-8'>
                {
                    isSeller && (
                        <h3 className=' text-text'>売る商品</h3>
                    )
                }
            </div>

            {orders.length > 0 && (
                <Link
                    href="/cart/cart-user-info"
                    className="bg-main text-white py-2 px-4 absolute bottom-20 left-1/2 -translate-x-1/2 w-[150px] rounded-md text-center"
                >
                    注文に進む
                </Link>
            )}

            <BottomTabs />
        </div>
    );
}