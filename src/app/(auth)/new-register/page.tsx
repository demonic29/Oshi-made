// app/new-register/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import sampleImg from '@/app/assets/imgs/logo.png'
import Image from "next/image";


export default function NewUserRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {

            // Create user account
            const registerResponse = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                setError(registerData.error || "アカウント作成に失敗しました");
                setLoading(false);
                return;
            }

            // Sign in the user
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("ログインに失敗しました");
                setLoading(false);
                return;
            }

            if (result?.ok) {
                router.push("/new-register/choose-role");
            }
        } catch (error) {
            console.error(error);
            setError("エラーが発生しました");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto grid items-center h-dvh p-6 bg-[#fffdfa]">
            <div>
                <div className="mb-8 text-center">
                    <div className='relative max-w-md w-[40%] mx-auto h-12.5'>
                        <Image
                            alt='this is image'
                            src={sampleImg}
                            fill
                            objectFit='contain'
                            className='rounded-lg'
                            loading='lazy'
                        />
                    </div>
                    <h3 className="ps-2 mt-4">新規登録</h3>

                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 w-[95%] mx-auto">
                    <div className="">
                        <label className="block text-[12px] text-text mb-2">
                            名前
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-3 text-sm py-3 bg-gray-100 rounded-full"
                            disabled={loading}
                        />
                    </div>

                    <div className="">
                        <label className="block text-[12px] text-text mb-2">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-3 py-2 bg-gray-100 rounded-full"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] text-text mb-2">
                            パスワード
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full px-3 py-2 bg-gray-100 rounded-full"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex overflow-hidden">
                        <Link
                            href="/register"
                            className="w-[48%] text-[12px] mx-auto text-center bg-gray-100 py-3 mt-8 rounded-full hover:bg-accent hover:text-text disabled:bg-gray-450"

                        >
                            キャンセル
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-[48%] text-[12px] mx-auto bg-main text-white py-5 mt-8 rounded-full hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {loading ? "処理中..." : "次へ"}
                        </Button>
                    </div>

                    {/* s */}
                </form>
            </div>
        </div>
    );
}