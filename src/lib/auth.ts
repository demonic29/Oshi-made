// lib/auth.ts
import { getServerSession, NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role?: Role  // Add role to session type
        } & DefaultSession['user']
    }
    
    interface User {
        role?: Role  // Add role to user type
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role?: Role  // Add role to JWT type
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
                    ...(user.role ? { role: user.role } : {}),
                }
            }
        })
    ],

    session: {
        strategy: 'jwt'
    },

    pages: {
        signIn: '/register',
    },
    
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            
            // Handle session update (when role changes)
            if (trigger === 'update' && session?.role) {
                token.role = session.role
            }
            
            // Fetch fresh role from database on each request (optional but recommended)
            if (token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { role: true }
                })
                if (dbUser && dbUser.role) {
                    token.role = dbUser.role
                }
            }
            
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
                session.user.role = token.role  // Add role to session
            }
            return session
        }
    }
}

export async function auth() {
    return await getServerSession(authOptions)
}