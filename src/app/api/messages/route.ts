import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Pusher from "pusher";

/* ---------------- PUSHER SERVER ---------------- */

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

/* ---------------- GET ---------------- */

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = request.nextUrl.searchParams.get("roomId");
    if (!roomId) {
        return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    const room = await prisma.room.findFirst({
        where: {
        id: roomId,
        OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
        },
    });

    if (!room) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
    });

    return NextResponse.json(messages);
    }

    /* ---------------- POST ---------------- */

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, roomId, type, fileUrl } = await request.json();
    
    if (!roomId) {
        return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
        },
    });

    if (!room) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
        data: {
            content: content || null,
            roomId,
            userId: session.user.id,
            type: type || "TEXT",
            fileUrl: fileUrl || null,
        },
        include: {
            user: { select: { name: true } },
        },
    });

    // 🔥 REALTIME EVENT (THIS WAS MISSING)
    await pusher.trigger(`room-${roomId}`, "new-message", message);

    return NextResponse.json(message);
}
