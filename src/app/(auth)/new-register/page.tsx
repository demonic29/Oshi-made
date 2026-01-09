// app/new-register/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <div className="max-w-md mx-auto mt-8 p-6">
        <h1 className="text-2xl font-bold mb-6">新規アカウント作成</h1>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    ユーザー名
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border-b"
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    メールアドレス
                </label>
                <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border-b"
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    パスワード
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border-b"
                    disabled={loading}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-main text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                {loading ? "処理中..." : "次へ"}
            </button>
        </form>
        </div>
    );
}