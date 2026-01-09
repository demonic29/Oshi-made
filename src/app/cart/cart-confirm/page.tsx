import HeaderBar from '@/components/ui/HeaderBar'
import Image from 'next/image'
import cartImg from '../../assets/imgs/1.png';
import BottomTabs from '@/components/ui/BottomTabs';
import Link from 'next/link';


export default function CartConfirmPage() {
    return (
        <div>
            <div className='px-4'>
                <HeaderBar title='注文内容確認' />
            </div>

            <div className='px-6 grid gap-6'>
                <div className='grid gap-2 border-b pb-4 border-b-gray-500'>
                    <p className='ps-4'>お届け先</p>
                    <div className='grid ps-6'>
                        <span className='text-gray-500 text-[13px]'>永岡 ひかり</span>
                        <span className='text-gray-500 text-[13px]'>573-0126, 大阪府, 枚方市津田西町, 2-13-4, 日本</span>
                    </div>
                </div>

                <div className='grid gap-2 border-b pb-4 border-b-gray-500'>
                    <p className='ps-4'>支払い方法</p>
                    <div className='grid ps-6'>
                        <span className='text-gray-500 text-[13px]'>クレジットカード</span>                    </div>
                </div>

                <div className='grid gap-2 border-b pb-4 border-b-gray-500'>
                    <p className='ps-4'>注文商品</p>
                    <div className='flex gap-3 ps-6'>
                        <div className='relative w-[100px] h-[100px]'>
                            <Image
                                src={cartImg}
                                alt='商品画像'
                                fill
                            />
                        </div>
                        <span className='mt-4'>クレジットカード</span>                    </div>
                </div>
            </div>

            <Link
                href="/cart/cart-finish"
                className="bg-main text-white py-2 px-4 absolute bottom-20 left-1/2 -translate-x-1/2  w-[150px] rounded-md text-center"
            >
                注文に確定
            </Link>


            <BottomTabs />
        </div>
    )
}
