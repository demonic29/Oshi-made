// app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const category = searchParams.get('category');
        const taste = searchParams.get('taste');
        const minStock = searchParams.get('minStock');

        // Build dynamic where clause
        const whereClause: any = {};

        // Text search
        if (query && query.trim() !== '') {
            whereClause.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ];
        }

        // Category filter
        if (category) {
            whereClause.category = category;
        }

        // Taste filter
        if (taste) {
            whereClause.taste = taste;
        }

        // Stock filter
        if (minStock) {
            whereClause.stock = {
                gte: parseInt(minStock),
            };
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            // include: {
            //     user: {
            //         select: {
            //             id: true,
            //             name: true,
            //         },
            //     },
            // },
        });

        return NextResponse.json({ 
            products,
            count: products.length,
            filters: { query, category, taste, minStock }
        }, { status: 200 });
    } catch (error) {
        console.error('Error searching products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}