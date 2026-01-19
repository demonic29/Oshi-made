'use client'

import Image from 'next/image'
import sampleImg from '@/app/assets/imgs/welcome/welcome_02.png'
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
        <div className='px-4 bg-[#fffdfa] flex flex-col gap-10 justify-center items-center pt-6'>
            <div className='relative max-w-md w-full h-[600px]'>
                <Image
                    alt='this is image'
                    src={sampleImg}
                    fill
                    objectFit='contain'
                    className='rounded-lg'
                />
            </div>

            <div className=' flex flex-col w-full gap-2'>
                <Button
                    className='py-2 max-w-[80%] mx-auto w-full bg-main text-center text-white'
                    href='/new-register'
                >
                    メールアドレス
                </Button>
                <Button
                    onClick={googleRegister}
                    className='py-2 max-w-[80%] mx-auto w-full border bg-main text-white'
                >
                    グーグルアカウント
                </Button>
            </div>

            {/* <Button className='bg-[#E37298] text-white w-full'>メールアドレス</Button>
            <Button className='border border-gray-400 w-full' onClick={googleRegister}>Google</Button> */}
        </div>
    )
}