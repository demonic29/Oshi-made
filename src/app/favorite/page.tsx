// app/favorites/page.tsx

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HeaderBar from '@/components/ui/HeaderBar';
import Link from 'next/link';
import Image from 'next/image';

export default async function FavoritesPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect('/api/auth/signin');
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
            product: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className='pb-20'>
            <HeaderBar title="お気に入り" />
            
            <div className='px-4 mt-6'>
                {favorites.length === 0 ? (
                    <div className='text-center py-12 text-gray-500'>
                        <p>お気に入りの商品がありません</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 gap-4'>
                        {favorites.map(({ product }) => (
                            <Link 
                                key={product.id} 
                                href={`/products/${product.id}`}
                                className='border rounded-lg overflow-hidden hover:shadow-md transition-shadow'
                            >
                                <div className='relative h-40'>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className='p-3'>
                                    <h3 className='font-semibold line-clamp-2'>
                                        {product.name}
                                    </h3>
                                    <p className='text-sm text-gray-500 mt-1'>
                                        {product.category}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}