'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
        <div className='flex justify-center w-full'>
            <div className="mt-8 p-6">
                <h1 className="text-2xl font-bold mb-6">ログイン</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="">
                    <form className="space-y-4" onSubmit={handleSubmit}>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">
                                    メールアドレス
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border-b"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-1">
                                    パスワード
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border-b"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-main text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {isLoading ? 'ログイン中...' : 'ログイン'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

