'use client'

import Link from 'next/link'
import { useCategory } from '../hooks/useCategory';
import { ItemCard } from '@/components/ui/ItemCard';
import BottomTabs from '@/components/ui/BottomTabs';
import '@/app/globals.css'

export default function Home() {

    const links = [
        { href: '/home/pickup', label: 'おすすめ' },
        { href: '/home/category', label: 'ピックアップ' },
    ];

    const { items, isLoading, error } = useCategory();

    return (
        <>
            <div className='mt-4 px-4'>
                <h1 className='font-bold text-center text-2xl'>推しめいど</h1>

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
                        <p className='text-center mt-8'>Loading...</p>
                    ) : error ? (
                        <p className='text-center mt-8'>Error loading data</p>
                    ) : (
                        <div className='grid grid-cols-2 gap-4 mt-8'>
                            {
                                items && items.map((item: any) => (
                                    <ItemCard
                                        key={item.id}
                                        {...item}
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
