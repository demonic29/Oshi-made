'use client'

import Image from 'next/image'
import sampleImg from '@/app/assets/imgs/1.png'
// import { Button } from '@/components/ui/button'
import Button from '@/components/Button'
import { signIn, signOut, useSession } from 'next-auth/react'


export default function RegisterPage() {

    // use the imported sigIn function
    const googleRegister = () => {
        signIn('google', {
            callbackUrl: '/'
        })
    }
    
    return (
        <div className='px-4 grid gap-10 justify-center items-center pt-6'>
            <div className='relative max-w-md w-full h-[400px]'>
                <Image
                    alt='this is image'
                    src={sampleImg}
                    fill
                    objectFit='cover'
                    className='rounded-lg'
                />
            </div>

            <div className='grid gap-2'>
                <Button
                    className='bg-main text-white'
                    href='/home'
                >
                    メールアドレス
                </Button>
                <Button
                    onClick={googleRegister}
                    className='border border-text text-main'
                >
                    Google
                </Button>
            </div>

            {/* <Button className='bg-[#E37298] text-white w-full'>メールアドレス</Button>
            <Button className='border border-gray-400 w-full' onClick={googleRegister}>Google</Button> */}
        </div>
    )
}
