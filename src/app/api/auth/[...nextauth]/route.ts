import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';


// Initialize Prisma Client
const prisma = new PrismaClient();

const handler = NextAuth({

    // 1. Configure the Prisma Adapter
    adapter: PrismaAdapter(prisma),

    // 2. Configure Providers (Google)
    providers: [
        GoogleProvider(
            {
                clientId: process.env.GOOGLE_CLIENT_ID ?? '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            }
        )
    ],

    // 3. Session Strategy
    session: {
        strategy: 'jwt'
    },

    // 4. Secret
    secret: process.env.NEXTAUTH_SECRET,
    debug: true
})
export { handler as GET, handler as POST }