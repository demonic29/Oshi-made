// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/* ---------------- GET ---------------- */

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roomId = request.nextUrl.searchParams.get('roomId');
        console.log("🆔 Fetching messages for roomId:", roomId);

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
        }

        // 🔐 SECURITY: Verify user has access to this room
        const room = await prisma.room.findFirst({
            where: { 
                id: roomId,
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id }
                ]
            }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found or access denied' }, { status: 403 });
        }

        const messages = await prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        console.log(`✅ Found ${messages.length} messages for room ${roomId}`);
        return NextResponse.json(messages);

    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/* ---------------- POST ---------------- */

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, roomId, type, fileUrl } = await request.json();
        console.log("📤 Creating message for roomId:", roomId);

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
        }

        // 🔐 SECURITY: Verify user has access to this room
        const room = await prisma.room.findFirst({
            where: { 
                id: roomId,
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id }
                ]
            }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found or access denied' }, { status: 403 });
        }

        const message = await prisma.message.create({
            data: {
                content: content || null,
                roomId,
                userId: session.user.id,
                type: type || 'TEXT',
                fileUrl: fileUrl || null,
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        // Update room's updatedAt timestamp
        await prisma.room.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        });

        console.log("✅ Message created:", message.id);
        return NextResponse.json(message);

    } catch (error) {
        console.error("❌ Error creating message:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}