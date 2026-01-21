// app/api/auth/sync/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { phone } = await req.json();
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Update user's phone
    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { phone },
    });

    // ✅ Find user's pending order and update status
    const pendingOrder = await prisma.order.findFirst({
        where: {
            userId: session.user.id,
            status: "pending",
        },
    });

    if (pendingOrder) {
        await prisma.order.update({
            where: { id: pendingOrder.id },
            data: { status: "phone_verified" },
        });
    }

    return Response.json({ user });
}