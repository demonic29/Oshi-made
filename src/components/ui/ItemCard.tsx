// components/ui/ItemCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface ItemCardProps {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    taste: string;
    stock: number;
}

export function ItemCard({ id, name, description, image, category, taste, stock }: ItemCardProps) {
    return (
        <Link href={`/products/${id}`} className='block'>
            <div className='border rounded-lg overflow-hidden hover:shadow-lg transition-shadow'>
                <div className='relative w-full h-48'>
                    <Image 
                        src={image} 
                        alt={name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className='p-3'>
                    <h3 className='font-semibold text-sm line-clamp-1'>{name}</h3>
                    <p className='text-xs text-gray-600 mt-1 line-clamp-2'>{description}</p>
                    <div className='flex gap-2 mt-2'>
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded'>{taste}</span>
                        {stock > 0 ? (
                            <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>在庫あり</span>
                        ) : (
                            <span className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded'>売り切れ</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Detail card for product detail page
interface ItemDetailCardProps {
    item: {
        id: string;
        name: string;
        description: string;
        image: string;
        category: string;
        taste: string;
        stock: number;
        createdAt: Date;
        updatedAt: Date;
    };
}

export function ItemDetailCard({ item }: ItemDetailCardProps) {
    return (
        <div className='px-4 mt-6'>
            {/* Product Image */}
            <div className='relative w-full h-96 rounded-lg overflow-hidden'>
                <Image 
                    src={item.image} 
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </div>

            {/* Product Info */}
            <div className='mt-6'>
                <h1 className='text-2xl font-bold'>{item.name}</h1>
                
                <div className='flex gap-2 mt-3'>
                    <span className='text-sm bg-gray-100 px-3 py-1 rounded-full'>{item.taste}</span>
                    <span className='text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full'>{item.category}</span>
                    {item.stock > 0 ? (
                        <span className='text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full'>在庫あり</span>
                    ) : (
                        <span className='text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full'>売り切れ</span>
                    )}
                </div>

                <div className='mt-6'>
                    <h2 className='font-semibold text-lg mb-2'>商品説明</h2>
                    <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>{item.description}</p>
                </div>

                <div className='mt-6 text-sm text-gray-500'>
                    <p>登録日: {new Date(item.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>

                {/* Action Buttons */}
                <div className='mt-8 flex gap-3'>
                    <button 
                        className='flex-1 bg-main text-white py-3 rounded-lg font-semibold hover:bg-main/90 transition-colors'
                        disabled={item.stock === 0}
                    >
                        {item.stock > 0 ? 'カートに追加' : '売り切れ'}
                    </button>
                    <button className='px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                        <i className="fa-regular fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}