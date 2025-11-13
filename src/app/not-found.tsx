import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='grid justify-center items-center h-screen'>
            <div className='grid gap-4 text-center px-4'>
                <h2 className='font-bold text-2xl'>ごめん、ページないねん笑</h2>
                <p className='text-sm'>君が探しているページは現在ないわ。ホームにもどって商品見といて</p>
                <Link href="/" className='bg-[#FFDEE9] p-2 rounded-lg'>ホーム</Link>
            </div>
        </div>
    )
}