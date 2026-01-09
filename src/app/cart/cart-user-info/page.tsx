import BottomTabs from '@/components/ui/BottomTabs'
import HeaderBar from '@/components/ui/HeaderBar'
import Link from 'next/link'
import React from 'react'

export default function CartUserInfo() {
    return (
        <div className='px-4'>
            <HeaderBar title='注文情報' />

            <form action="" className='mt-8 px-4 grid gap-8'>
                <div className=''>
                    <p className='font-semibold'>氏名（フルネーム）</p>
                    <input placeholder='長岡ひかり' type="text" name='user_name' className='w-full mt-2 border-b border-b-gray-400' />
                </div>

                <div className=''>
                    <p className='font-semibold'>電話番号(ハイフンなし)</p>
                    <p className='text-[13px] mt-2'>配送時にご連絡させていただく事があります</p>
                    <input placeholder='07045576171' type="text" name='user_name' className='w-full mt-2 border-b border-b-gray-400' />
                </div>

                <div className=''>
                    <p className='font-semibold'>郵便番号（半角数字）</p>
                    <input placeholder='5730126' type="text" name='user_name' className='w-full mt-2 border-b border-b-gray-400' />
                </div>

                <div className=''>
                    <p className='font-semibold'>都道府県</p>
                    <input placeholder='大阪府' type="text" name='user_name' className='w-full mt-2 border-b border-b-gray-400' />
                </div>

                <div className=''>
                    <p className='font-semibold'>枚方市</p>
                    <input placeholder='枚方市' type="text" name='user_name' className='w-full mt-2 border-b border-b-gray-400' />
                </div>

                <div className=''>
                    <p className='font-semibold'>以降の住所</p>
                    <input placeholder='津田西町２−１３−４' type="text" name='user_name' className='w-full mt-2 border-b border-b-gray-400' />
                </div>
            </form>

            <Link
                href="/cart/cart-payment"
                className="bg-main text-white py-2 px-4 absolute bottom-20 left-1/2 -translate-x-1/2  w-[150px] rounded-md text-center"
            >
                次に進む
            </Link>

            <BottomTabs />
        </div>
    )
}
