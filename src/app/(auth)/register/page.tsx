'use client'

import Button from '@/components/Button'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import AuthHeader from '../components/_AuthHeader'


export default function RegisterPage() {

    // use the imported sigIn function
    const googleRegister = () => {
        signIn('google', {
            callbackUrl: '/new-register/choose-role'
        })
    }
    
    return (
        <div className='px-4 bg-[#fffdfa] flex flex-col justify-center h-dvh overflow-hidden'>
            
            <AuthHeader title="会員登録" desc="アプリの機能使うためには会員登録が必要になります！"/>

            <div className='flex flex-col w-full gap-4 mb-8'>
                <Button
                    className='py-2 max-w-[80%] text-[12px] mx-auto w-full bg-main text-center text-white'
                    href='/new-register'
                >
                    メールアドレス
                </Button>
                <Button
                    onClick={googleRegister}
                    className='py-2 max-w-[80%] text-[12px] mx-auto w-full border border-text text-text'
                >
                    グーグル
                </Button>
            </div>
            <hr className='text-gray-300 w-[80%] mx-auto mb-4'/>

            <p className='text-center text-[12px]'>
                アカウントお持ちの方 -
                <Link href="/login" className='text-main ps-1 underline'>
                    ログイン
                </Link>
            </p>
            {/* <Button className='bg-[#E37298] text-white w-full'>メールアドレス</Button>
            <Button className='border border-gray-400 w-full' onClick={googleRegister}>Google</Button> */}
        </div>
    )
}