// app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    const buyerId = session.user.id;

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let room = await prisma.room.findFirst({
        where: {
        productId,
        buyerId,
        },
    });

    if (!room) {
        room = await prisma.room.create({
        data: {
            productId,
            buyerId,
            sellerId: product.sellerId,
        },
        });
    }

    return NextResponse.json({ roomId: room.id });
}
