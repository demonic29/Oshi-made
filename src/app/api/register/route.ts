// app/api/register/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "このメールアドレスは既に登録されています" },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // role is optional, will be set later
            }
        });

        return NextResponse.json({ 
        success: true, 
        userId: user.id 
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
        { error: "アカウント作成に失敗しました" },
        { status: 500 }
        );
    }
}