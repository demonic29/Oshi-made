import HeaderBar from '@/components/ui/HeaderBar';
import { ItemDetailCard } from '@/components/ui/ItemCard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    
    // Fetch product from database
    const product = await prisma.product.findUnique({
        where: {
            id: id,
        },
    });

    // If product not found, show 404
    if (!product) {
        notFound();
    }

    return (
        <div className='pb-20'>
            <HeaderBar title={product.name} />

            <div>
                <ItemDetailCard item={product} />
            </div>
        </div>
    );
}

// Generate static params for all products (optional, for better performance)
export async function generateStaticParams() {
    const products = await prisma.product.findMany({
        select: {
            id: true,
        },
    });

    return products.map((product) => ({
        id: product.id,
    }));
}