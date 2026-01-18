'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderBar from './HeaderBar'
import { useEffect, useState } from 'react'

import logo from '@/app/assets/imgs/logo.png';

type Room = {
    id: string
    buyer: {
        name: string;
        image: string;
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
    }, []) // ✅ run once on mount

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
                                className="flex items-center gap-3 border-b py-2"
                            >
                                <Image
                                    src={room.buyer.image || logo}
                                    alt={room.buyer.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full boder-1"
                                />

                                <div>
                                    <h3 className="font-medium">
                                        {room.buyer.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Chat about this product
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
