'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderBar from './HeaderBar'
import { useEffect, useState } from 'react'

import logo from '@/app/assets/imgs/logo.png';
import { Message } from '@/app/chat/[roomId]/roomType'
import { useSession } from 'next-auth/react'
import Loading from './Loading'
import GlobalButton from '../GlobalButton'

type Room = {
    id: string
    buyer: {
        id: string;
        name: string;
        image: string;
    }
    seller: {
        id: string;
        name: string;
        image: string;
    }
    product: {
        name: string;
    }
    isBuyer: boolean
    lastMessage?: {
        content: string;
        type: string;
        createdAt: string;
    } | null
}

export default function ChatPage() {
    const { data: session, status } = useSession();
    const [isLoading, setLoading] = useState(true)
    const [rooms, setRooms] = useState<Room[]>([])

    useEffect(() => {

        if (status !== 'authenticated') return;

        const fetchRoomData = async () => {
            try {
                const res = await fetch('/api/rooms')

                if (!res.ok) {
                    throw new Error('Failed to fetch rooms')
                }

                const data = await res.json()
                console.log(data);
                setRooms(data)
            } catch (error) {
                console.error('Error fetching rooms:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRoomData()
    }, [status])

    // wait for session to load
    // if (status !== 'authenticated') {
    //     return (

    //     )
    // }

    return (
        <div>
            <HeaderBar title='チャット' />

            <div className="p-2">
                {isLoading ? (
                    <p className='flex text-main justify-center items-center h-screen'>少々お待ちを。。。</p>
                ) : status !== 'authenticated' ? (
                    <div className=''>
                        <HeaderBar title='チャット' />

                        <div className='flex flex-col overflow-hidden gap-4 justify-center items-center h-screen'>
                            <div className='text-center mb-6'>
                                <p className='text-lg font-bold mb-2'>このチャットは会員のみになっています。</p>
                                <p>始めに会員登録してください。</p>
                            </div>

                            <Link href="/new-register">
                                <GlobalButton title='新規登録' />
                            </Link>
                            <Link className='underline' href="/login">ログイン</Link>
                        </div>
                    </div>

                ) : rooms.length === 0 ? (
                    <p>まだチャットはありません</p>
                ) : (
                    <div className="">
                        {rooms.map((room) => {

                            const otherUser = room.isBuyer ? room.seller : room.buyer;
                            const currentUserIs = room.isBuyer ? 'buyer' : "seller";

                            return (
                                <Link
                                    key={room.id}
                                    href={`/chat/${room.id}`}
                                    className="flex items-center gap-3 border-b border-b-gray-300 py-6"
                                >
                                    <div className='relative border border-main overflow-hidden rounded-full p-2 w-[50px] h-[50px]'>
                                        <Image
                                            src={otherUser.image || logo}
                                            alt={otherUser.name || 'ユーザー名'}
                                            fill
                                            className="object-cover"
                                            loading='eager'
                                        />
                                    </div>

                                    <div>
                                        <h3 className="font-bold">
                                            {otherUser.name || '指名なし'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            <span>商品名: </span> {room.product.name}                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
