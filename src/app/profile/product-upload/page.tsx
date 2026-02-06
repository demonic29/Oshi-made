'use client'

import HeaderBar from '@/components/ui/HeaderBar'
import { ItemCard } from '@/components/ui/ItemCard'
import { Product } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'

export default function ProductUploadPage() {

    const { data: session, status } = useSession();
    const [userProducts, setUserProducts] = useState<Product[]>([]);
    const [isLoadingUserProducts, setIsLoadingUserProducts] = useState(true);

    const userRole = session?.user?.role;

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
        <div className='px-4'>
            <HeaderBar title='商品一覧' />

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
    )
}
