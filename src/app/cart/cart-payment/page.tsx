import BottomTabs from '@/components/ui/BottomTabs'
import HeaderBar from '@/components/ui/HeaderBar'
import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <div>
            <div className='px-4'>
                <HeaderBar title='注文者情報' />
            </div>

            <ul className='flex flex-col text-center px-8 gap-8 mt-8'>
                支払い方法
                <Link href="/cart/cart-confirm">
                    <li className='border font-normal border-main py-1 rounded-sm w-full'>コンビニ支払い</li>

                </Link>
                <Link href="/cart/cart-confirm">
                    <li className='border font-normal border-main py-1 rounded-sm w-full'>クレジットカード </li>

                </Link>
                <Link href="/cart/cart-confirm">
                    <li className='border font-normal border-main py-1 rounded-sm w-full'>グーグルペイ</li>

                </Link>
            </ul>

            <BottomTabs />
        </div>
    )
}
