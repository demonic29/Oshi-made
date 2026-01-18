import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get all products for homepage
export async function GET() {
    const session = await getServerSession(authOptions);

    try {
        const products = await prisma.product.findMany({
            where: {
                sellerId: session?.user.id
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}