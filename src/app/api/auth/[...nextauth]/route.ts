import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // or wherever your prisma.ts is located

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '', // Fixed typo
        })
    ],

    session: {
        strategy: 'jwt'
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: true
})

export { handler as GET, handler as POST }