"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
// import { Camera } from 'react-camera-pro'

// Images
import img1 from "@/app/assets/imgs/1.png"
import img2 from "@/app/assets/imgs/2.png"
import img3 from "@/app/assets/imgs/3.png"
import Link from "next/link";

const Welcome = () => {
    const [screens] = useState([
        { 
            text: "あけぼのやわらかな光が、まどろむ教室をそっとつつむ。いつもの席に、ひとりのわたし。視界は、窓の外の空にとどまる。",
            img: img1, 
            id: 1 
        },
        { 
            text: "うたかたのような夢を見ていたのかもしれない。えんぴつを手に、ノートに心の色をそっと重ねる。", 
            img: img2, 
            id: 2 
        },
        { 
            text: "ささやかなぬいぐるみを、間に置いて。それは、言葉にならない約束のようなもの。", 
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
        <div className="flex flex-col pt-6 items-center opacity-0 animate-fadeIn">

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex no-scrollbar overflow-x-scroll space-x-5 px-5 max-w-full scroll-smooth snap-x snap-mandatory"
            >
                {screens.map((screen) => (
                <div
                    key={screen.id}
                    className="shrink-0 w-[90vw] snap-center"
                >
                    <div className="relative h-[400px]">
                        <Image
                            src={screen.img}
                            alt="home-screen-img"
                            fill
                            className="rounded-lg object-cover"
                        />
                    </div>
                    <p className="text-center text-[14px] text-text font-semibold my-4 min-h-[60px]">{screen.text}</p>
                </div>
                ))}
            </div>

        {/* Dot pagination */}
        <div className="flex space-x-2 mt-5">
            {/* {screens.map((screen, index)) )} */}
            {
                screens.map((screen, index) => {
                    return (
                        <div key={index}>
                            {
                                currentIndex === screens.length - 1 ? <div className="hidden"></div> : (
                                    <div
                                        key={screen.id}
                                        className={`w-3 h-3 rounded-full ${
                                        index === currentIndex ? "bg-main" : "bg-gray-300"
                                    }`}
                                />
                                )
                            }
                        </div>
                    )
                })
            }
        </div>

        {/* footerBtn */}
        <div className="w-full px-4">
            {currentIndex === screens.length - 1 && (
                <div>
                    <Link
                        href="/register"
                        className="bg-main w-full text-center block rounded-lg text-white py-3 mb-2"
                        >
                        会員登録
                    </Link>
                    <Link href="/home" className="underline text-center block">
                        スキップ
                    </Link>
                </div>
            )}
        </div>
        </div>
    );
};

export default Welcome;
