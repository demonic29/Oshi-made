'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderBar from './HeaderBar'
import { useEffect, useState } from 'react'

import logo from '@/app/assets/imgs/logo.png';
import { Message } from '@/app/chat/[roomId]/roomType'

type Room = {
    id: string
    buyer: {
        name: string;
        image: string;
    }
    product: {
        name: string;
    }
}

export default function ChatPage() {
    const [isLoading, setLoading] = useState(true)
    const [rooms, setRooms] = useState<Room[]>([])

    useEffect(() => {
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
    }, []) 


    return (
        <div>
            <HeaderBar title='チャット' />

            <div className="p-2">
                {isLoading ? (
                    <p>Loading...</p>
                ) : rooms.length === 0 ? (
                    <p>No chats yet</p>
                ) : (
                    <div className="grid gap-2">
                        {rooms.map((room) => (
                            <Link
                                key={room.id}
                                href={`/chat/${room.id}`}
                                className="flex items-center gap-3 border-b border-b-gray-300 py-2"
                            >
                                <div className='relative border border-main overflow-hidden rounded-full p-2 w-[50px] h-[50px]'>
                                    <Image
                                        src={room.buyer.image || logo}
                                        alt={room.buyer.name}
                                        fill
                                        className="object-cover"
                                        loading='eager'
                                    />
                                </div>

                                <div>
                                    <h3 className="font-medium">
                                        {room.buyer.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        <span>商品名:</span>{room.product.name} ・ 
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
