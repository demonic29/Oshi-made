'use client'

import Image from 'next/image'
import sampleImg from '../../../../public/imgs/sample_img_2.png'
import { Button } from '@/components/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'


export default function RegisterPage() {

    // use the imported sigIn function
    const googleRegister = () => {
        signIn('google', {
            callbackUrl: '/'
        })
    }
    
    return (
        <div className='px-6 flex flex-col gap-4 justify-center items-center h-screen'>
            <div className='relative w-full h-[500px]'>
                <Image
                    alt='this is image'
                    src={sampleImg}
                    fill
                    objectFit='cover'
                />
            </div>

            <Button className='bg-[#E37298] text-white w-full'>メールアドレス</Button>
            <Button className='border border-gray-400 w-full' onClick={googleRegister}>Google</Button>
        </div>
    )
}
