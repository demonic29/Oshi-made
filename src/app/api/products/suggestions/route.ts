// app/api/products/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }

        // Get unique product names that match the query
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                name: true,
            },
            take: 5, // Limit to 5 suggestions
            distinct: ['name'],
        });

        const suggestions = products.map(p => p.name);

        return NextResponse.json({ 
            suggestions,
            count: suggestions.length 
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}