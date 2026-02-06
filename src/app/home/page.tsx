'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react';
import { ItemCard } from '@/components/ui/ItemCard';
import BottomTabs from '@/components/ui/BottomTabs';
import '@/app/globals.css'
import Image from 'next/image';
import logo from '../assets/imgs/logo.png'

interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    taste: string;
    stock: number;
    createdAt: string;
}

export default function Home() {
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
        <>
            <div className='mt-8 px-4'>
                <h1 className='relative flex justify-center'>
                    <Image
                        alt='oshimade-logo'
                        src={logo || 'logo-image'}
                        width={100}
                        height={100}
                        objectFit='contain'
                        loading='lazy'
                        quality={75}
                    />
                </h1>
                
                {   
                    isLoading ? (
                        <p className='flex justify-center items-center h-dvh text-main font-bold '>しばらくお待ち下さい。。</p>                        
                    ) : error ? (
                        <p className='text-center mt-8 text-red-500'>{error}</p>
                    ) : (
                        <div className='grid grid-cols-2 gap-4 mt-8 pb-24'>
                            {
                                products.map((product) => (
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
                                ))
                            }
                        </div>
                    )
                }
            </div>

            <BottomTabs/>
        </>
    )
}