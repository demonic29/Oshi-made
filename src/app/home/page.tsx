'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react';
import { ItemCard } from '@/components/ui/ItemCard';
import BottomTabs from '@/components/ui/BottomTabs';
import '@/app/globals.css'
import Image from 'next/image';
import logo from '../assets/imgs/category/logo.png'
import { ProductSkeleton } from '@/components/Skeleton';

interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    taste: string;
    stock: number;
    createdAt: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const links = [
        { href: '/home/pickup', label: 'おすすめ' },
        { href: '/home/category', label: 'ピックアップ' },
    ];

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
                    />
                </h1>

                <div className='flex gap-16 mt-4 justify-center'>
                    {
                        links.map((link) => (
                            <Link href={link.href} key={link.label} className='font-semibold text-[14px]'>
                                {link.label}
                            </Link>
                        ))
                    }
                </div>
                
                {   
                    isLoading ? (
                        <p className='text-center mt-8 text-main font-bold'>しばらくお待ち下さい。。</p>                        
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

            <BottomTabs/>
        </>
    )
}