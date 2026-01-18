'use client'

import BottomTabs from '@/components/ui/BottomTabs'
import ChatWindow from '@/components/ui/ChatWindow'
import { SessionProvider, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChatPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter()

  useEffect(() => {
    if (user?.name === 'unauthenticated') {
      router.push('/register')
    }
  }, [router, user?.name])

  const fetchRoomData = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) {
        throw new Error("failed to fetch room");
      }
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <SessionProvider>
      <div className="container mx-auto px-4 h-screen">
        <div className="h-full max-w-4xl mx-auto">
          <ChatWindow />
        </div>
        <BottomTabs />
      </div>
    </SessionProvider>
  )
}