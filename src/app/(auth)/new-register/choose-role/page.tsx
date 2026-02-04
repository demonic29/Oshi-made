// app/new-register/choose-role/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Import from helper
import AuthHeader from "../../components/_AuthHeader";
import { User } from "iconsax-reactjs";
import { ShoppingBag } from "lucide-react";

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
        <div className="p-4 flex flex-col justify-center h-dvh overflow-hidden bg-[#fffdfa]">
            
            <AuthHeader title="役割" desc="役割を決めた上お進みください"/>
            
            <div className="space-y-4 ps-8 flex gap-8">
                <form action={selectSeller}>
                    <button 
                        type="submit"
                        className="w-32 h-32 text-[13px] flex flex-col justify-center items-center bg-gray-100 gap-2 text-text  rounded-full "
                    >
                        <User size="32" className="text-main"/>
                        作家
                    </button>
                </form>
                
                <form action={selectBuyer}>
                    <button 
                        type="submit"
                        className="w-32 h-32 text-[13px] flex flex-col justify-center items-center gap-2 bg-gray-100 text-text rounded-full"
                    >
                        <ShoppingBag size="32" className="text-main"/>
                        購入者
                    </button>
                </form>
            </div>
        </div>
    );
}