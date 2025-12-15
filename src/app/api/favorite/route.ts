// app/api/products/favorites/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Assuming you have a Favorite model
        const favorites = await prisma.favorite.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                product: true, // Include the full product details
            },
        });

        const products = favorites.map(fav => fav.product);

        return NextResponse.json({ 
            products,
            count: products.length 
        });
    } catch (error) {
        console.error('Error fetching favorite products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch favorite products' },
            { status: 500 }
        );
    }
}