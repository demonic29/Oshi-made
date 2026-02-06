// components/ui/ItemCard.tsx
'use client'

import Link from 'next/link';

import { Heart } from 'iconsax-reactjs';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/app/actions/favorite';
import { useRouter } from 'next/navigation';
import GlobalButton from '../GlobalButton';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';

interface ItemCardProps {
    id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    taste: string;
    stock: number;
}

export function ItemCard({ id, name, images, taste, }: ItemCardProps) {
    return (
        <Link href={`/products/${id}`} className='block min-w-full mb-2 shrink-0' prefetch={true}>
            <div className='relative w-full h-48 overflow-hidden rounded-lg'>
                <Image
                    src={images[0] ?? 'nope'}
                    alt={name}
                    loading='lazy'
                    fill
                    quality={75} // reduce image quality for performance
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className='mt-2'>
                <span className='text-[10px] bg-text text-white px-2 py-1 rounded'>{taste}</span>
            </div>
            <div className='mt-2'>
                <h3 className='text-[13px] line-clamp-2'>{name}</h3>
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

    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleOrder = async () => {
        if (!isAuthenticated) {
            onOpen()
            return
        }

        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: item.id,
            }),
        });

        if (!res.ok) {
            console.error(await res.text());
            return;
        }

        const data = await res.json();

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
                    loading='lazy'
                    quality={75}
                    alt={item.name}
                    fill
                    className="object-cover"
                    
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

            <div className='mt-6 px-4 overflow-hidden'>
                <h1 className='text-xl'>{item.name}</h1>

                <div className='mt-6'>
                    <h2 className='text-sm text-gray-500 mb-2'>商品説明</h2>
                    <p className='text-gray-700 leading-loose tracking-wide text-[13px] whitespace-pre-wrap'>
                        {item.description}
                    </p>
                </div>

                <div className='flex gap-2 mt-4'>
                    <span className='text-[10px] bg-gray-100 px-3 py-1 rounded-md'>
                        {item.taste}
                    </span>
                    <span className='text-[10px] bg-gray-100 px-3 py-1 rounded-md'>
                        {item.category}
                    </span>
                    {item.stock > 0 ? (
                        <span className='text-[10px] bg-text text-white px-3 py-1 rounded-md'>
                            在庫あり
                        </span>
                    ) : (
                        <span className='text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-md'>
                            売り切れ
                        </span>
                    )}
                </div>

                <div className='mt-6 text-[10px] text-gray-500'>
                    <p>登録日: {new Date(item.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>

                <div className='relative'>
                    <Modal
                        isOpen={isOpen}
                        placement='center'
                        onClose={onClose}
                        className='bg-gray-100 absolute bottom-0 rounded-t-2xl mx-auto w-full pb-8'
                    >
                        <ModalContent>
                            <ModalHeader className='mt-12 text-xl'>会員登録</ModalHeader>
                            <ModalBody>
                                この機能のロックを解除するには登録してください

                                <div className='flex mt-4 gap-4 items-center'>
                                    <Link href="/register">
                                        <GlobalButton title='新規登録' />
                                    </Link>
                                    <Link href="/login">
                                        <button className='text-text underline'>ログイン</button>
                                    </Link>
                                </div>
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </div>

                <div>
                    {
                        isUser === item.sellerId ? '' : (
                            <div className='mt-8 flex gap-3'>
                                <button
                                    onClick={handleOrder}
                                    disabled={item.stock === 0}
                                    className="flex-1 bg-main text-white py-3 text-sm rounded-lg hover:bg-main/90 disabled:opacity-50"
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
        </div>
    );
}