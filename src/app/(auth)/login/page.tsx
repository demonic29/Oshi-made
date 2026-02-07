'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AuthHeader from '../components/_AuthHeader'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        })

        if (result?.error) {
            setError('Invalid credentials')
            setIsLoading(false)
        } else {
            router.push('/home')
        }
    }

    return (
        <div className='grid items-center h-dvh'>


            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div>

                <AuthHeader title='おかえり' desc='前回入力したメールとパスワードを入れてください' />

                <div className="px-8">
                    <form onSubmit={handleSubmit}>

                        <div className=''>
                            <div className='mb-8'>
                                <label htmlFor="email" className="block text-[12px] mb-2 text-gray-500">
                                    メールアドレス
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-100 rounded-full"
                                />
                            </div>
                            <div className='mb-4'>
                                <label htmlFor="password" className="block text-[12px] mb-2 text-gray-500">
                                    パスワード
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-100 rounded-full"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-main mt-8 text-white rounded-full py-6 disabled:bg-gray-400"
                        >
                            {isLoading ? 'ログイン中...' : 'ログイン'}
                        </Button>

                        <p className='text-center text-[12px] mt-8'>
                            アカウントお持ちのない方 -
                            <Link href="/register" className='text-main ps-1 underline'>
                                会員登録
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

