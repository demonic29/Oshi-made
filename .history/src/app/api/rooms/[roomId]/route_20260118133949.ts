export async function GET(
  req: Request,
  { params }: { params: { roomId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await prisma.room.findUnique({
    where: { id: params.roomId },
    include: {
      product: true,
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // 🔐 SECURITY
  if (room.buyerId !== session.user.id && room.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isBuyer = room.buyerId === session.user.id;
  const otherUser = isBuyer ? room.seller : room.buyer;

  return NextResponse.json({
    ...room,
    otherUser,
    isBuyer,
  });
}
