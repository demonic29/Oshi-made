// components/ProfileCard.tsx
'use client'

import SignOutButton from '../../components/ui/SignOutButton';
import HeaderBar from '@/components/ui/HeaderBar';
import { ItemCard } from '@/components/ui/ItemCard';
import ProfileHeader from './ProfileHeader';
import { useEffect, useState } from 'react';
import { Product } from '@prisma/client';
import BottomTabs from '@/components/ui/BottomTabs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProfileCard() {
    const { data: session, status } = useSession();
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [userProducts, setUserProducts] = useState<Product[]>([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
    const [isLoadingUserProducts, setIsLoadingUserProducts] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get user role from session
    const userRole = session?.user?.role;
    const currentUser = session?.user?.id;

    // Fetch favorite products
    useEffect(() => {
        const fetchFavorites = async () => {
            if (status === 'loading') return;

            if (!session?.user?.id) {
                setIsLoadingFavorites(false);
                return;
            }

            try {
                setIsLoadingFavorites(true);
                const response = await fetch('/api/favorite');

                if (!response.ok) {
                    throw new Error('Failed to fetch favorites');
                }

                const data = await response.json();
                setFavoriteProducts(data.products || []);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                setError('お気に入りの読み込みに失敗しました');
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        fetchFavorites();
    }, [session, status]);

    // Fetch user's uploaded products (only for sellers)
    useEffect(() => {
        const fetchUserProducts = async () => {
            if (status === 'loading') return;

            if (!session?.user?.id || userRole !== 'SELLER') {
                setIsLoadingUserProducts(false);
                return;
            }

            try {
                setIsLoadingUserProducts(true);

                // IMPORTANT: Pass userId as query parameter
                const response = await fetch(`/api/product`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user products');
                }

                const data = await response.json();
                setUserProducts(data.products || []);
            } catch (err) {
                console.error('Error fetching user products:', err);
            } finally {
                setIsLoadingUserProducts(false);
            }
        };

        fetchUserProducts();
    }, [session?.user?.id, status, userRole]);

    return (
        <div className="flex flex-col overflow-y-auto pb-37.5 px-4">
            <HeaderBar title='アカウント' />

            <div className="">
                <ProfileHeader />

                {/* Favorite Products Section */}
                <section className='mt-6'>
                    <div className='flex items-center justify-between mb-3'>
                        <h2 className='font-semibold text-text border-b-main border-b-2 text-base flex items-center gap-2'>
                            お気に入りの商品
                        </h2>
                        {favoriteProducts.length > 0 && (
                            <span className='text-xs text-gray-500'>
                                {favoriteProducts.length}件
                            </span>
                        )}
                    </div>

                    {isLoadingFavorites ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
                        </div>
                    ) : error ? (
                        <div className='text-center py-12 bg-red-50 rounded-lg'>
                            <p className='text-red-500 text-sm'>{error}</p>
                        </div>
                    ) : favoriteProducts.length === 0 ? (
                        <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
                            <p className='text-gray-500 text-sm'>まだお気に入りの商品がありません</p>
                        </div>
                    ) : (
                        <div className='flex gap-3 overflow-x-auto pb-2 no-scrollbar'>
                            {favoriteProducts.map((product) => (
                                <div key={product.id} className='shrink-0 w-40'>
                                    <ItemCard
                                        id={product.id}
                                        name={product.name}
                                        description={product.description}
                                        images={product.images}
                                        category={product.category}
                                        taste={product.taste}
                                        stock={product.stock}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* User's Uploaded Products Section - Only for Sellers */}
                {currentUser && userRole === 'SELLER' ? (
                    <section className='mt-8'>
                        <div className='flex items-center justify-between mb-3'>
                            <h2 className='font-semibold text-text border-b-main border-b-2 text-base flex items-center gap-2'>
                                出品した商品
                            </h2>
                            <Link href="/profile/product-upload" className='text-sm text-main'>
                                    商品一覧見る &gt;
                            </Link>
                        </div>

                        {isLoadingUserProducts ? (
                            <div className='flex items-center justify-center py-12'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
                            </div>
                        ) : userProducts.length === 0 ? (
                            <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
                                <p className='text-gray-500 text-sm mb-4'>まだ出品した商品がありません</p>
                            </div>
                        ) : (
                            <div className=''>
                                <div className='grid grid-cols-2 gap-4'>
                                    {userProducts.map((product) => (
                                        <ItemCard
                                            key={product.id}
                                            id={product.id}
                                            name={product.name}
                                            description={product.description}
                                            images={product.images}
                                            category={product.category}
                                            taste={product.taste}
                                            stock={product.stock}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                ) : ''}

                {/* Sign Out Section */}
                <div className='mt-8'>
                    <SignOutButton />
                </div>
            </div>

            <BottomTabs />
        </div>
    );
}