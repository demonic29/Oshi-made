import React from 'react'
import Image from 'next/image'
import sampleImg from '@/app/assets/imgs/logo.png'

interface Type{
    title: string
    desc: string
}


export default function AuthHeader({ title, desc }: Type) {
    return (
        <div>
            <div className='relative max-w-md w-[40%] ms-8 h-12.5'>
                <Image
                    alt='this is image'
                    src={sampleImg}
                    fill
                    objectFit='contain'
                    className='rounded-lg'
                    loading='lazy'
                />
            </div>

            <div className='ps-8 grid gap-3 my-8'>
                <h3>{ title }</h3>
                <p className='text-[12px] text-gray-500'>{ desc }</p>
            </div>

        </div>
    )
}
