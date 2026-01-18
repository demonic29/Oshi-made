// app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const message = await prisma.message.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
}