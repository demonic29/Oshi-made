// app/actions/favorites.ts
'use server'

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path to your authOptions
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(productId: string) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
        return { success: false, error: 'ログインが必要です' };
        }

        // Get user by email
        const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        });

        if (!user) {
        return { success: false, error: 'ユーザーが見つかりません' };
        }

        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
        where: {
            userId_productId: {
            userId: user.id,
            productId,
            },
        },
        });

        if (existingFavorite) {
        // Remove favorite
        await prisma.favorite.delete({
            where: {
            id: existingFavorite.id,
            },
        });
        
        revalidatePath(`/products/${productId}`);
        revalidatePath('/favorites');
        
        return { success: true, isFavorited: false };
        } else {
        // Add favorite
        await prisma.favorite.create({
            data: {
            userId: user.id,
            productId,
            },
        });
        
        revalidatePath(`/products/${productId}`);
        revalidatePath('/favorites');
        
        return { success: true, isFavorited: true };
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return { success: false, error: 'エラーが発生しました' };
    }
}

export async function checkIsFavorited(productId: string) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
        return false;
        }

        const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        });

        if (!user) {
        return false;
        }

        const favorite = await prisma.favorite.findUnique({
        where: {
            userId_productId: {
            userId: user.id,
            productId,
            },
        },
        });

        return !!favorite;
    } catch (error) {
        return false;
    }
}