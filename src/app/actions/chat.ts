"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function getOrCreateChatRoom(productId: string) {
    const session = await getServerSession();

    if (!session?.user?.id) {
        return { success: false };
    }

    // Get product seller
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true },
    });

    if (!product) {
        return { success: false };
    }

    const buyerId = session.user.id;
    const sellerId = product.sellerId;

    // Prevent seller chatting with themselves
    if (buyerId === sellerId) {
        return { success: false, error: "Cannot chat with yourself" };
    }

    // Find existing room
    let room = await prisma.room.findFirst({
        where: {
        productId,
        buyerId,
        },
    });

    // Create if not exists
    if (!room) {
        room = await prisma.room.create({
        data: {
            productId,
            buyerId,
            sellerId,
        },
        });
    }

    return { success: true, roomId: room.id };
}
