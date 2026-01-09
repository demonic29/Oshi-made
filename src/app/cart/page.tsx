import Image from 'next/image'
import cartImg from '../assets/imgs/1.png';
import HeaderBar from '@/components/ui/HeaderBar';
import Link from 'next/link';
import BottomTabs from '@/components/ui/BottomTabs';

export default function CartPage() {
    const carts = [
        { name: "アクセサリー", href: "/category/accessories", src: cartImg, items: ["ヘアクリップ /", "ピアス /", "イヤリング..."] },
        { name: "雑貨", href: "/category/goods", src: cartImg, items: ["うちわ /", "ペンライトリボン /", "ロゼッタ..."] },
        { name: "推し活", href: "/category/oshikatsu", src: cartImg, items: ["キーホルダー /", "スマホカバー /", "その他..."] },
    ]
    return (
        <div>
            <div className='px-4'>
                <HeaderBar title='カート'/>
            </div>
            {
                carts.map(cart => (
                    <div className='px-8 mt-8' key={cart.name}>
                        <div className='flex gap-4 pb-4 border-gray-300 border-b'>
                            <div className='relative w-[100] h-[100]'>
                                <Image
                                    src={cartImg}
                                    alt='商品画像'
                                    fill
                                />
                            </div>
                            <p className='mt-2'>{cart.name}</p>
                        </div>
                    </div>
                ))
            }

            <Link
                href="/cart/cart-user-info"
                className="bg-main text-white py-2 px-4 absolute bottom-20 left-1/2 -translate-x-1/2  w-[150px] rounded-md text-center"
            >
                注文に進む
            </Link>

            <BottomTabs/>
        </div>
    )
}
