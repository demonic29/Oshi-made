'use client';
import { useRouter } from "next/navigation";

export default function HeaderBar({ title} : { title: string }) {

    const router = useRouter();

    return (
        <div className="w-full border-b-1 border-gray-400 mb-4">
            <div className="my-4 grid grid-cols-3 items-center px-4">
                <button onClick={() => router.back()}>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-6"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                </button>
                <h1 className="text-center font-bold [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden [-webkit-line-clamp:1]">{decodeURIComponent(title)}</h1>
                {/* <h1></h1> */}
            </div>
        </div>
    );
}
