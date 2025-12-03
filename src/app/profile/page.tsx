// components/ProfileCard.tsx
'use client'

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import SignOutButton from '../../components/ui/SignOutButton';
import HeaderBar from '@/components/ui/HeaderBar';
import Button from '@/components/Button';
import Link from 'next/link';
import { ItemCard } from '@/components/ui/ItemCard';
import { useCategory } from '../hooks/useCategory';
// import ButtonUi from './ui/ButtonUi'; // Assuming you have this component

export default function ProfileCard() {
    // 1. Get Session Data
    const { data: session, status } = useSession();
    const { items, isLoading, error } = useCategory();


    // 2. Handle Loading State
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-40">
                <p>Loading user profile...</p>
            </div>
        );
    }

    // 3. Handle Not Authenticated State
    if (!session) {
        return (
            <div className="text-center p-6 bg-red-100 rounded-lg">
                <p className="text-red-700 font-semibold">
                    You are not signed in. Please log in to view your profile.
                </p>
                {/* Optionally, include a link/button to the sign-in page */}
            </div>
        );
    }

    // 4. Display User Data
    const user = session.user;

    return (
        <div className=" overflow-hidden">

            <HeaderBar title='アカウント'/>

            <div className='px-4 flex flex-col min-h-screen'> 
                <div className='flex-1'>
                    <div className="flex items-center gap-4">
                        {/* User Image */}
                        {user?.image && (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                                <Image 
                                    src={user?.image}
                                    alt={user.name || 'User Profile'}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                        )}
                        
                        {/* User Name and Email */}
                        <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                    </div>

                    <div className='flex mt-4 gap-4'>
                        <Button className='border text-[14px] text-center' href="/profile/edit">
                            <i className="fa-solid fa-user-pen"></i> アカウント設定
                        </Button>
                        <Button className='border text-[14px] text-center' href="/profile/edit">
                            <i className="fa-solid fa-plus"></i> 商品登録
                        </Button>
                    </div>
                    
                    <div>
                        <p className='font-semibold text-main mt-8 text-[14px]'><i className="fa-solid fa-bookmark text-main"></i> お気に入りの商品</p>

                        {
                            isLoading ? (
                                <p className='text-center mt-8'>Loading...</p>
                            ) : error ? (
                                <p className='text-center mt-8'>Error loading data</p>
                            ) : (
                                <div className='flex overflow-scroll gap-2'>
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
                </div>
                
                <div className='flex-1'>
                    <SignOutButton/>
                </div>
            </div>
        </div>
    );
}

