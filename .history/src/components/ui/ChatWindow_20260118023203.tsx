'use client'

import Image from 'next/image'
import { useUsers } from '@/hooks/useUsers';
import Link from 'next/link';
import HeaderBar from './HeaderBar';
import { useState } from 'react';

export default function ChatPage() {

    const [isLoading, setLoading] = useState(false);
    const [users, setUsers] = useState<string[]>();

    const fetchRoomData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rooms');
            if (!res.ok) {
                throw new Error("failed to fetch room");
            }
            const data = await res.json();
            setUsers(data);
            console.log(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching room:', error);
        }
    }

    fetchRoomData();

    return (
        <div>
            <HeaderBar title='チャット' />
            <div className="">
                {
                    isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className='grid gap-2'>
                            {
                                users && users.map((user: any) => (
                                    <Link href={`/chat/${user.id}`} key={user.id} className='flex py-2 gap-2 border-b border-gray-300'>
                                        <Image
                                            alt={user.firstName || 'this is user name'}
                                            src={user.image || 'This is user image'}
                                            width={50}
                                            height={50}
                                            className='rounded-full'
                                        />

                                        <div>
                                            <h3 className='list-title'>{user.firstName}</h3>
                                            <p className='list-desc'>{user.university}</p>
                                        </div>
                                    </Link>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}