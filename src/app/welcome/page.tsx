"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
// import { Camera } from 'react-camera-pro'

// Images
import img1 from "@/app/assets/imgs/welcome_01.png"
import img2 from "@/app/assets/imgs/2.png"
import img3 from "@/app/assets/imgs/3.png"
import Link from "next/link";

const Welcome = () => {
    const [screens] = useState([
        { 
            text: "あけぼのやわらかな光が、まどろむ教室をそっとつつむ。いつもの席に、ひとりのわたし。視界は、窓の外の空にとどまる。",
            img: img3, 
            id: 1 
        },
        { 
            text: "うたかたのような夢を見ていたのかもしれない。えんぴつを手に、ノートに心の色をそっと重ねる。", 
            img: img2, 
            id: 2 
        },
        { 
            text: "", 
            img: img1, 
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
                <div className="relative w-full h-[70vh]">
                    <Image
                    src={screen.img}
                    alt="home-screen-img"
                    fill
                    className="rounded-lg object-contain"
                    />
                </div>
                <p className="text-center text-[14px] text-text font-semibold my-4 min-h-[60px]">
                    {screen.text}
                </p>
                </div>
            ))}
            </div>

            {/* Dot pagination */}
            <div className="flex space-x-2 my-4">
            {screens.map((_, index) => (
                currentIndex !== screens.length - 1 && (
                <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                    index === currentIndex ? "bg-main" : "bg-gray-300"
                    }`}
                />
                )
            ))}
            </div>

            {/* Footer */}
            <div className="w-full px-4 pb-6">
            {currentIndex === screens.length - 1 && (
                <>
                <Link
                    href="/register"
                    className="bg-main w-full text-center block rounded-lg text-white py-3 mb-2"
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
    );

};

export default Welcome;
