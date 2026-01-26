import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: true, // This fetches the Product data for each OrderItem
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }
}