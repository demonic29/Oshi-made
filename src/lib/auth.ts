// lib/auth.ts
import { getServerSession, NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google' // ← Add this
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
        id: string
        } & DefaultSession['user']
    }
}

export const authOptions: NextAuthOptions = {

    adapter: PrismaAdapter(prisma),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user || !user.password) {
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            }
        })
    ],

    session: {
        strategy: 'jwt'
    },

    pages: {
        signIn: '/register', // Changed from /login
    },
    
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    }
}

export async function auth() {
    return await getServerSession(authOptions)
}