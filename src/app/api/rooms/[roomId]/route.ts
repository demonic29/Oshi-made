// app/api/rooms/[roomId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    const { roomId } = await params;
    
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            product: {
                select: {
                    name: true,
                }
            }
        }
    });

    if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
}