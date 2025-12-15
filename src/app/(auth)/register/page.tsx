'use client'

import Image from 'next/image'
import sampleImg from '@/app/assets/imgs/1.png'
// import { Button } from '@/components/ui/button'
import Button from '@/components/Button'
import { signIn } from 'next-auth/react'


export default function RegisterPage() {

    // use the imported sigIn function
    const googleRegister = () => {
        signIn('google', {
            callbackUrl: '/new-register/choose-role'
        })
    }
    
    return (
        <div className='px-4 flex flex-col gap-10 justify-center items-center pt-6'>
            <div className='relative max-w-md w-full h-[400px]'>
                <Image
                    alt='this is image'
                    src={sampleImg}
                    fill
                    objectFit='cover'
                    className='rounded-lg'
                />
            </div>

            <div className=' flex flex-col w-full gap-2'>
                <Button
                    className='bg-main text-center text-white'
                    href='/new-register'
                >
                    メールアドレス
                </Button>
                <Button
                    onClick={googleRegister}
                    className='border border-text text-main'
                >
                    グーグル
                </Button>
            </div>

            {/* <Button className='bg-[#E37298] text-white w-full'>メールアドレス</Button>
            <Button className='border border-gray-400 w-full' onClick={googleRegister}>Google</Button> */}
        </div>
    )
}