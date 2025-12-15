'use client';

import Link from "next/link";
import Image, { StaticImageData } from "next/image";

export function TasteUi({ title, imgSrc, href }: { title: string; imgSrc: string; href: string}) {
    return (
        <div>
            <Link href={href} className="relative group">
                <Image
                    src={imgSrc}
                    alt={title}
                    width={150}
                    height={110}
                    className="w-full h-full object-cover rounded-md"
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent rounded-lg"></div>

                <p className="absolute inset-0 flex items-center justify-center text-white text-md font-semibold">
                    {title}
                </p>
            </Link>
        </div>
    )
}

export function CategoryUi (
    {href, src, name, items, width, height}: { 
        href: string; 
        src: StaticImageData; 
        name: string; 
        items: string[] ; 
        width?: number; 
        height?: number;
    }) 
    {
    return (
        <Link href={href} className='flex gap-4 border-b-gray-300 border-b py-4'>
            <Image
                src={src || 'no-image'}
                alt={name}
                width={width}
                height={height}
                className="object-cover rounded-md"
            />
            <div>
                <p className={`font-bold`}>{name}</p>
                <ul className='flex gap-2'>
                    {
                        items.map((item) => (
                            <li key={item} className='text-[12px]'>{item}</li>
                        ))
                    }
                </ul>
            </div>
        </Link>
    )
}