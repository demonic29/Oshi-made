import { prisma } from "@/lib/prisma";
import { signIn } from "next-auth/react";
import Form from "next/form";
import { redirect } from "next/navigation";

export default function NewUserRegister() {
    // In your email registration form
    async function createUser(formData: FormData) {
        "use server";

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        await prisma.user.create({
            data: { name, email, password }
        });

        // Sign in the user after creation
        await signIn('credentials', {
            email,
            password,
            redirect: false
        });

        redirect(`/new-register/choose-role`); // No userId needed!
    }



    return (
        <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">新規アカウント作成</h1>
        <Form action={createUser} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-lg mb-2">
                    ユーザー名
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="永岡ひかり"
                    className="w-full px-4 py-2 border-b"
                />
            </div>

            <div>
                <label htmlFor="title" className="block text-lg mb-2">
                    メールアドレス
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="hikari08170725@iclou.com"
                    className="w-full px-4 py-2 border-b"
                />
            </div>

            <div>
                <label htmlFor="title" className="block text-lg mb-2">
                    パスワード
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="hikari08170725@iclou.com"
                    className="w-full px-4 py-2 border-b"
                />
            </div>

            
            <button
                type="submit"
                className="w-full bg-main text-white py-3 rounded-lg hover:bg-blue-600"
            >
            次へ
            </button>
        </Form>
        </div>
    );
}