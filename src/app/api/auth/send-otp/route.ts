import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { phone, roomId, price } = await req.json();

    try {
        // Use a transaction to ensure everything succeeds or nothing does
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check if phone is already in use by another user
            const existingUser = await tx.user.findUnique({
                where: { phone: phone }
            });

            if (existingUser && existingUser.id !== session.user.id) {
                throw new Error("Phone number already in use");
            }

            // 2. Update the user's phone (only if it's different or not used by others)
            await tx.user.update({
                where: { id: session.user.id },
                data: { phone: phone }
            });

            if (roomId) {
                // 3. Find the room to get the product ID
                const room = await tx.room.findUnique({
                    where: { id: roomId },
                });

                if (!room || !room.productId) {
                    throw new Error("Product not found in room");
                }

                // 4. Create the Order AND the OrderItem together
                return await tx.order.create({
                    data: {
                        userId: session.user.id,
                        total: Number(price), // Use the custom price from UI
                        status: "phone_verified",
                        items: {
                            create: {
                                productId: room.productId,
                                quantity: 1,
                                price: Number(price), // Record the price at the time of sale
                            }
                        }
                    }
                });
            }
        });

        return NextResponse.json({ success: true, order: result });
    } catch (error: any) {
        console.error("❌ Order Creation Error:", error);
        
        // Return user-friendly error messages
        if (error.message === "Phone number already in use") {
            return NextResponse.json({ error: "This phone number is already registered to another account" }, { status: 409 });
        }
        
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
        }
        
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}