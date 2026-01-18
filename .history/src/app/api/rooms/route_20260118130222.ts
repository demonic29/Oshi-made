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

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let room = await prisma.room.findFirst({
        where: {
            productId,
            userId: session?.user?.id
        },
    });

    if (!room) {
        room = await prisma.room.create({
        data: {
            productId,
            buyerId: session.user.id,
            sellerId: product.sellerId
        },
        });
    }

    return NextResponse.json({ roomId: room.id });
}


export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
        where: { userId: session.user.id },
        include: {
        product: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(rooms);
}
