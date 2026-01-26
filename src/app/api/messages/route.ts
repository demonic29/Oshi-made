
// api/ messages
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Pusher from "pusher";

/* ---------------- PUSHER SERVER ---------------- */

// Initialize Pusher with error handling
let pusher: Pusher;
try {
    pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        useTLS: true,
    });
} catch (error) {
    console.error("❌ Failed to initialize Pusher:", error);
}

/* ---------------- POST ---------------- */

export async function POST(request: NextRequest) {
    console.log("📨 POST /api/messages - Start");
    
    try {
        // 1. Get session
        const session = await getServerSession(authOptions);
        console.log("📨 Session check:", {
            hasSession: !!session,
            userId: session?.user?.id,
            userEmail: session?.user?.email
        });

        if (!session?.user?.id) {
            console.error("❌ Unauthorized: No valid session found");
            return NextResponse.json(
                { 
                    error: "Unauthorized",
                    message: "Please sign in to send messages",
                    code: "UNAUTHORIZED"
                }, 
                { status: 401 }
            );
        }

        // 2. Parse request body
        let body;
        try {
            body = await request.json();
            console.log("📨 Request body parsed:", body);
        } catch (parseError) {
            console.error("❌ Failed to parse request body:", parseError);
            return NextResponse.json(
                { 
                    error: "Invalid JSON", 
                    message: "Request body must be valid JSON",
                    code: "INVALID_JSON"
                }, 
                { status: 400 }
            );
        }

        const { content, roomId, type, fileUrl } = body;
        
        // 3. Validate required fields
        if (!roomId) {
            console.error("❌ Bad Request: Missing roomId");
            return NextResponse.json(
                { 
                    error: "Room ID required",
                    message: "roomId is required",
                    code: "MISSING_ROOM_ID"
                }, 
                { status: 400 }
            );
        }

        console.log("📨 Validating access to room:", roomId);

        // 4. Check if user has access to the room
        const room = await prisma.room.findFirst({
            where: {
                id: roomId,
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id }
                ],
            },
        });

        console.log("📨 Room check result:", {
            foundRoom: !!room,
            roomId: room?.id,
            buyerId: room?.buyerId,
            sellerId: room?.sellerId,
            currentUserId: session.user.id
        });

        if (!room) {
            console.error("❌ Forbidden: User not authorized for this room");
            return NextResponse.json(
                { 
                    error: "Forbidden",
                    message: "You don't have access to this chat room",
                    code: "ROOM_ACCESS_DENIED"
                }, 
                { status: 403 }
            );
        }

        // 5. Create message
        console.log("📨 Creating message in database...");
        let message;
        try {
            message = await prisma.message.create({
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
            console.log("✅ Message created successfully:", {
                messageId: message.id,
                type: message.type,
                content: message.content,
                roomId: message.roomId
            });
        } catch (dbError: any) {
            console.error("❌ Database error creating message:", dbError);
            return NextResponse.json(
                { 
                    error: "Database Error",
                    message: "Failed to save message",
                    details: dbError.message,
                    code: "DATABASE_ERROR"
                }, 
                { status: 500 }
            );
        }

        // 6. Trigger Pusher event (if pusher is available)
        if (pusher) {
            try {
                console.log("📨 Triggering Pusher event for room:", `room-${roomId}`);
                await pusher.trigger(`room-${roomId}`, "new-message", message);
                console.log("✅ Pusher event triggered successfully");
            } catch (pusherError: any) {
                console.error("⚠️ Pusher error (non-critical):", pusherError);
                // Don't fail the request if Pusher fails, just log it
            }
        } else {
            console.warn("⚠️ Pusher not initialized, skipping real-time update");
        }

        // 7. Return success response
        return NextResponse.json({
            ...message,
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("❌ Unexpected error in POST /api/messages:", error);
        return NextResponse.json(
            { 
                error: "Internal Server Error",
                message: "An unexpected error occurred",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: "INTERNAL_ERROR"
            }, 
            { status: 500 }
        );
    }
}

/* ---------------- GET ---------------- */

export async function GET(request: NextRequest) {
    console.log("📨 GET /api/messages - Start");
    
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" }, 
                { status: 401 }
            );
        }

        const roomId = request.nextUrl.searchParams.get("roomId");
        
        if (!roomId) {
            return NextResponse.json(
                { error: "Room ID required" }, 
                { status: 400 }
            );
        }

        // Check room access
        const room = await prisma.room.findFirst({
            where: {
                id: roomId,
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id }
                ],
            },
        });

        if (!room) {
            return NextResponse.json(
                { error: "Forbidden" }, 
                { status: 403 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: "asc" },
            include: { user: { select: { name: true } } },
        });

        console.log(`✅ Retrieved ${messages.length} messages for room ${roomId}`);
        
        return NextResponse.json(messages);
        
    } catch (error) {
        console.error("❌ Error in GET /api/messages:", error);
        return NextResponse.json(
            { error: "Internal server error" }, 
            { status: 500 }
        );
    }
}