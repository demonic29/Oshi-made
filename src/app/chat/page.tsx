'use client'

import Image from 'next/image'
import { useUsers } from '../hooks/useUsers';
import Link from 'next/link';

export default function ChatPage() {

    const {users, isLoading, error} = useUsers();

    return (
        <div>
             <div className="w-full border-b-1 border-gray-400 mb-4">
                <div className="my-4 px-4">
                    <h1 className="text-center font-bold [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden [-webkit-line-clamp:1]">チャット</h1>
                </div>
            </div>

            <div className='px-4'>
                {
                    isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>error...</p> 
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
                                            <h3 className='list-title'>{ user.firstName }</h3>
                                            <p className='list-desc'>{ user.university }</p>
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
