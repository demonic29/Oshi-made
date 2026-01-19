// app/api/rooms/[roomId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> | { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const roomId = resolvedParams.roomId;
    
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    // Use findFirst instead of findUnique if 'id' is not @unique/@id
    const room = await prisma.room.findFirst({
      where: { id: roomId },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true, image: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 🔐 SECURITY: Check if user is part of this room
    if (room.buyerId !== session.user.id && room.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isBuyer = room.buyerId === session.user.id;
    const otherUser = isBuyer ? room.seller : room.buyer;

    return NextResponse.json({
      ...room,
      otherUser,
      isBuyer,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}