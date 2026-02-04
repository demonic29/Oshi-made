"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
// import { Camera } from 'react-camera-pro'

// Images
import img2 from "@/app/assets/imgs/welcome/welcome_01.png"
import img3 from "@/app/assets/imgs/welcome/welcome_02.png"
import Link from "next/link";

const Welcome = () => {
    const [screens] = useState([
        // {
        //     text: "",
        //     img: img1,
        //     id: 1
        // },
        {
            text: "",
            img: img2,
            id: 2
        },
        {
            text: "",
            img: img3,
            id: 3
        },
    ]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // scroll event
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollLeft;
            const itemWidth = scrollRef.current.offsetWidth;
            const newIndex = Math.floor((scrollPosition + itemWidth / 2) / itemWidth);
            setCurrentIndex(newIndex);
        }
    };

    return (
        <div className="flex bg-[#FFFDFA] flex-col min-h-screen pt-6 items-center overflow-hidden opacity-0 animate-fadeIn">

            {/* Slider area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 flex no-scrollbar bg-[#FFFDFA] overflow-x-scroll space-x-5 px-5 max-w-full scroll-smooth snap-x snap-mandatory"
            >
                {screens.map((screen) => (
                    <div
                        key={screen.id}
                        className="shrink-0 w-[90vw] snap-center"
                    >
                        <Image
                            src={screen.img}
                            alt="home-screen-img"
                            className=""
                        />
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="relative w-full">
                <div className="bottom-44 absolute w-full">
                    {currentIndex === screens.length - 1 && (
                        <>
                            <Link
                                href="/register"
                                className="bg-main w-[60%] rounded-full mx-auto text-center block text-white py-3 mb-2"
                            >
                                会員登録
                            </Link>
                            <Link href="/home" className="underline text-center block">
                                スキップ
                            </Link>
                        </>
                    )}
                </div>
            </div>

        </div>
    );

};

export default Welcome;
