// app/api/user/update/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth"; // Your NextAuth config

export async function POST(request: Request) {
    try {
        // Get current session
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get data from request
        const { name } = await request.json();
        console.log("Received name:", name);

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name },
        });

        return NextResponse.json({ 
            success: true, 
            user: updatedUser 
        });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}