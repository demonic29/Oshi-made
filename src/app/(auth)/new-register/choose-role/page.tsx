// app/new-register/choose-role/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Import from helper

export default async function RoleSelectionPage() {
    const session = await auth();
    
    if (!session?.user?.email) {
        redirect('/register');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        redirect('/register');
    }

    // If user already has a role, redirect to home
    if (user.role) {
        redirect('/home');
    }

    async function selectBuyer() {
        "use server";
        
        const session = await auth();
        if (!session?.user?.email) return;
        
        await prisma.user.update({
            where: { email: session.user.email },
            data: { role: "BUYER" }
        });
        
        redirect("/home");
    }

    async function selectSeller() {
        "use server";
        
        const session = await auth();
        if (!session?.user?.email) return;
        
        await prisma.user.update({
            where: { email: session.user.email },
            data: { role: "SELLER" }
        });
        
        redirect("/home");
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">ロールを選択</h1>
            
            <p className="text-sm text-gray-500 mb-4">
                Welcome, {user.email}
            </p>
            
            <div className="space-y-4">
                <form action={selectBuyer}>
                    <button 
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                    >
                        購入者として登録
                    </button>
                </form>
                
                <form action={selectSeller}>
                    <button 
                        type="submit"
                        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
                    >
                        出品者として登録
                    </button>
                </form>
            </div>
        </div>
    );
}