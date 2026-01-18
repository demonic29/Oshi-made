// components/ui/ItemCard.tsx
'use client'

import Link from 'next/link';

import { Heart } from 'iconsax-reactjs';
import Image, { StaticImageData } from 'next/image';
import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/app/actions/favorite';
import { toast } from 'sonner'; // or your preferred toast library
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ItemCardProps {
    id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    taste: string;
    stock: number;
}

export function ItemCard({ id, name, description, images, category, taste, stock }: ItemCardProps) {
    return (
        <Link href={`/products/${id}`} className='block w-full'>
            <div className='relative w-full h-48 overflow-hidden rounded-lg'>
                <Image
                    src={images[0] ?? 'nope'}
                    loading='eager'
                    alt={name}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className='mt-2'>
                <h3 className='font-semibold text-sm line-clamp-1'>{name}</h3>
                {/* <p className='text-xs text-gray-600 mt-1 line-clamp-2'>{description}</p> */}
                <div className='flex gap-2 mt-2'>
                    <span className='text-xs bg-gray-100 px-2 py-1 rounded'>{taste}</span>
                    {stock > 0 ? (
                        <span className='text-xs bg-accent px-2 py-1 rounded'>在庫あり</span>
                    ) : (
                        <span className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded'>売り切れ</span>
                    )}
                </div>
            </div>
        </Link>
    );
}


// components/ItemCard.tsx

interface ItemDetailCardProps {
    item: {
        id: string;
        name: string;
        description: string;
        images: string[];
        category: string;
        taste: string;
        stock: number;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string
    }
    initialIsFavorited: boolean;
    isAuthenticated: boolean;
    isUser?: string;
}

export function ItemDetailCard({
    item,
    initialIsFavorited,
    isAuthenticated,
    isUser
}: ItemDetailCardProps) {

    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [activeImage, setActiveImage] = useState(
        item.images[0] ?? '/no-images.png'
    )

    const handleOrder = async () => {
        if (!isAuthenticated) {
            router.push('/api/auth/signin');
            return;
        }

        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: item.id,
            }),
        });

        const data = await res.json();
        console.log(data);

        if (data.roomId) {
            router.push(`/chat/${data.roomId}`);
        }
    };


    const handleFavoriteClick = () => {
        if (!isAuthenticated) {
            router.push('/api/auth/signin');
            return;
        }

        startTransition(async () => {
            const result = await toggleFavorite(item.id);

            if (result.success) {
                setIsFavorited(result.isFavorited!);
                console.log(
                    result.isFavorited
                        ? 'お気に入りに追加しました'
                        : 'お気に入りから削除しました'
                );
            } else {
                console.error(result.error);
            }
        });
    };

    return (
        <div className='mt-6 overflow-scroll'>
            {/* Main image */}
            <div className="relative w-full h-96">
                <Image
                    src={activeImage}
                    loading='eager'
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
                <div className="mt-3 flex ps-2 gap-2 overflow-x-auto">
                    {item.images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImage(img)}
                            className={`relative w-20 h-20 rounded-md border ${activeImage === img
                                ? 'border-main'
                                : 'border-gray-200'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${item.name} ${index + 1}`}
                                fill
                                className="object-cover rounded-md"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className='mt-6 px-2 overflow-hidden'>
                <h1 className='text-2xl font-bold'>{item.name}</h1>

                <div className='flex gap-2 mt-3'>
                    <span className='text-sm bg-gray-100 px-3 py-1 rounded-full'>
                        {item.taste}
                    </span>
                    <span className='text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full'>
                        {item.category}
                    </span>
                    {item.stock > 0 ? (
                        <span className='text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full'>
                            在庫あり
                        </span>
                    ) : (
                        <span className='text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full'>
                            売り切れ
                        </span>
                    )}
                </div>

                <div className='mt-6'>
                    <h2 className='font-semibold text-lg mb-2'>商品説明</h2>
                    <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                        {item.description}
                    </p>
                </div>

                <div className='mt-6 text-sm text-gray-500'>
                    <p>登録日: {new Date(item.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>

                {
                    isUser === item.sellerId ? '' : (
                        <div className='mt-8 flex gap-3'>
                            <button
                                onClick={handleOrder}
                                disabled={item.stock === 0}
                                className="flex-1 bg-main text-white py-3 rounded-lg font-semibold hover:bg-main/90 disabled:opacity-50"
                            >
                                {item.stock > 0 ? 'オーダーする' : '売り切れ'}
                            </button>
                            <button
                                onClick={handleFavoriteClick}
                                disabled={isPending}
                                className={`px-6 border rounded-lg transition-colors ${isFavorited
                                    ? 'bg-red-50 border-red-300'
                                    : 'border-gray-300 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                                title={
                                    !isAuthenticated
                                        ? 'ログインしてお気に入りに追加'
                                        : isFavorited
                                            ? 'お気に入りから削除'
                                            : 'お気に入りに追加'
                                }
                            >
                                <Heart
                                    size={24}
                                    variant={isFavorited ? "Bold" : "Linear"}
                                    className={isFavorited ? 'text-red-600 animate-pulse' : 'text-gray-600'}
                                />
                            </button>
                        </div>
                    )
                }

            </div>
        </div>
    );
}