'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderBar from './HeaderBar'
import { useEffect, useState } from 'react'

type Room = {
    id: string
    user: {
        id: string
        // name: string
        image: string
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
                                {/* <Image
                                    src={room.user.image[0] || '/placeholder.png'}
                                    alt={room.user.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                /> */}

                                <div>
                                    <h3 className="font-medium">
                                        {room.user.name}
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
