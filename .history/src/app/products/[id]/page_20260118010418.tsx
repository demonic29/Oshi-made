// app/products/[id]/page.tsx
import HeaderBar from '@/components/ui/HeaderBar';
import { ItemDetailCard } from '@/components/ui/ItemCard';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import BottomTabs from '@/components/ui/BottomTabs';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    const currentUser = session?.user?.id;

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        notFound();
    }

    let isFavorited = false;
    
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user && prisma.favorite) { // Check if favorite model exists
            try {
                const favorite = await prisma.favorite.findUnique({
                    where: {
                        userId_productId: {
                            userId: user.id,
                            productId: product.id
                        },
                    },
                });
                isFavorited = !!favorite;
            } catch (error) {
                console.error('Favorite check error:', error);
            }
        }
    }

    return (
        <div className='pb-20'>
            <div className='px-2'>
                <HeaderBar title={product.name} />
            </div>
            <div>
                <ItemDetailCard 
                    item={product} 
                    initialIsFavorited={isFavorited}
                    isAuthenticated={!!session}
                    isUser={currentUser}
                />
            </div>

            <BottomTabs/>
        </div>
    );
}