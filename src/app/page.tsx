// app/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function Welcome() {
    const session = await auth();
    
    if (!session?.user?.email) {
        redirect('/welcome');
    }

    // Check if user exists and has a role
    const userData = await prisma.user.findUnique({
        where: {
            email: session.user.email
        }
    });

    if (!userData) {
        redirect('/welcome');
    }

    // If user exists but no role, go to role selection
    if (!userData.role) {
        redirect('/new-register/choose-role');
    }

    // User has role, go to home
    redirect('/home');
}