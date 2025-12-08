// components/ProfileCard.tsx
'use client'

import Image from 'next/image';
import SignOutButton from '../../components/ui/SignOutButton';
import HeaderBar from '@/components/ui/HeaderBar';
import Link from 'next/link';
import { ItemCard } from '@/components/ui/ItemCard';
import { useCategory } from '../hooks/useCategory';
import ProfileHeader from './ProfileHeader';
import { useEffect, useState } from 'react';
import { Product } from '@prisma/client';
// import ButtonUi from './ui/ButtonUi'; // Assuming you have this component

export default function ProfileCard() {
    // 1. Get Session Data
    // const { items, isLoading, error } = useCategory();

        const [products, setProducts] = useState<Product[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

     // Fetch products from API
        useEffect(() => {
            const fetchProducts = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch('/api/products');
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch products');
                    }
                    
                    const data = await response.json();
                    setProducts(data.products || []);
                } catch (err) {
                    console.error('Error fetching products:', err);
                    setError('Failed to load products');
                } finally {
                    setIsLoading(false);
                }
            };
    
            fetchProducts();
        }, []);
    

    return (
        <div className="pb-[100px] overflow-hidden">

            <HeaderBar title='アカウント'/>

            <div className='px-4 flex flex-col min-h-screen'> 
                <div className='flex-1'>
                    
                    <ProfileHeader/>
                    
                    <div>
                        <p className='font-semibold text-main mt-8 text-[14px]'><i className="fa-solid fa-bookmark text-main"></i> お気に入りの商品</p>

                        {
                    isLoading ? (
                        <p className='text-center mt-8'>Loading...</p>
                    ) : error ? (
                        <p className='text-center mt-8 text-red-500'>{error}</p>
                    ) : products.length === 0 ? (
                        <p className='text-center mt-8 text-gray-500'>まだ商品がありません</p>
                    ) : (
                        <div className='grid grid-cols-2 gap-4 mt-8 pb-24'>
                            {
                                products.map((product) => (
                                    <ItemCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        description={product.description}
                                        image={product.image}
                                        category={product.category}
                                        taste={product.taste}
                                        stock={product.stock}
                                    />
                                ))
                            }
                        </div>
                    )
                }
                        
                    </div>
                </div>
                
                <div className='flex-1'>
                    <SignOutButton/>
                </div>
            </div>
        </div>
    );
}

