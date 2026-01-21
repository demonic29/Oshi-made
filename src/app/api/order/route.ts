// app/api/orders/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            items: {
                include: {
                    product: true, // Include product details
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return Response.json({ orders });
}