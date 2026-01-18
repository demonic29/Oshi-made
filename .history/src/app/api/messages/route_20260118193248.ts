// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { content, roomId, type, fileUrl } = await request.json();

    const message = await prisma.message.create({
        data: {
            content,
            roomId,
            userId: session.user.id,
            type: type || 'TEXT',
            fileUrl
        },
        include: {
            user: {
                select:{
                    name: true,
                }
            }
        }
    });

    return NextResponse.json(message);
}

export async function GET(request: NextRequest) {
    const roomId = request.nextUrl.searchParams.get('roomId');
    
    if (!roomId) {
        return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }
    
    const messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'asc' },
        include: {
            user: {
                select: {
                    name: true,
                    // avatar: true
                }
            }
        }
        // include: {
        //     product: true,
        //     seller: {select: {name: true}},
        //     buyer: { select: {nmae: true}}
        // }
    });

    return NextResponse.json(messages);
}

