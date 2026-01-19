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
        <div className="p-4 flex flex-col justify-center items-center mt-20 bg-[#fffdfa] h-full">
            
            <div>
                <h1 className="text-2xl font-bold mb-6">新規アカウント登録</h1>
            
                <p className="text-sm text-gray-900 font-bold mb-4">
                    利用方法
                </p>
            </div>
            
            <div className="space-y-4 flex gap-20">
                <form action={selectSeller}>
                    <button 
                        type="submit"
                        className="w-full underline text-main  py-3 rounded-lg "
                    >
                        作家
                    </button>
                </form>
                
                <form action={selectBuyer}>
                    <button 
                        type="submit"
                        className="w-full underline  text-main py-3 rounded-lg"
                    >
                        購入者
                    </button>
                </form>
            </div>
        </div>
    );
}