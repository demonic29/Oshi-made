import Link from 'next/link'
import React from 'react'

export default function CartFinishPage() {
    return (
        <div className='flex flex-col gap-2 justify-center items-center h-screen'>
            <p className='text-lg'>ご注文完了が完了しました</p>
            <p>ご注文ありがとうございます</p>

            <div className='flex mt-8 justify-center'>
                <Link
                    href="/home"
                    className="bg-main text-white py-2 px-4  w-[150px] rounded-md text-center"
                >
                    ホームへ戻る
                </Link>
            </div>
        </div>
    )
}
