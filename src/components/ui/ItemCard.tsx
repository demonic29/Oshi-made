/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/16/solid";
import { ChatBubbleLeftIcon } from "@heroicons/react/16/solid";

export function ItemCard(item: any) {
    return (
        <Link href={`/products/${item.id}`} className="py-6 bg-gray-100 px-2">
            <Image
                src={item.images[0]}
                alt={item.title}
                width={200}
                height={200}
                className="my-2"
            />
            <h2 className="font-semibold mb-2 [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden [-webkit-line-clamp:1]">{item.title}</h2>
            <p className="text-sm text-slate-900 inline px-2 py-1 rounded-lg bg-[#DDCADE]">{item.category}</p>
        </Link>
    )
}


export function ItemDetailCard({item}: any) {

    // if(!item || !item.images) return null;

    return (
        <div className="px-4">

            {/* product-image */}
            <div className="relative w-full h-[300px]">
                <Image
                    src={item.images?.[0] || 'no-image'}
                    alt={item.title || 'no-items-found'}
                    fill
                    className="my-2"
                />
            </div>

            {/* product-info */}
            <div className="flex items-center mt-4 gap-4">
                <h2 className="font-semibold mb-2 text-[24px] [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden [-webkit-line-clamp:1]">{item.title}</h2>
                <p className="text-[12px] text-slate-900 inline px-2 py-1 rounded-lg bg-[#DDCADE]">{item.category}</p>
            </div>
            <div className="grid gap-4">
                <p>{item.price} 円 ~ </p>
                <p>{item.description}</p>
            </div>

            {/* user-info */}
            {/* <div className="flex gap-2">
                <Image
                    alt="customer-image"
                    src={item.userImage}
                    width={30}
                    height={30}
                    className="rounded-full object-cover"
                />

                <p className="font-bold">{item.userName}</p>
            </div> */}

            {/* action-button */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <p className="flex rounded-md gap-2 justify-center items-center text-[14px] font-semibold border border-[#D4D4D4] py-2">
                    <HeartIcon className="w-5"/>
                    お気に入り
                </p>
                <Link href={`/chat/${item.id}`} className="flex rounded-md gap-2 justify-center items-center text-[14px] font-semibold bg-[#DDCADE] py-2">
                    <ChatBubbleLeftIcon className="w-5"/>
                    オーダーする
                </Link>
            </div>
        </div>
    )
}
