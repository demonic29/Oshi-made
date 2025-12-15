'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Home2, Messages3, ProfileCircle, ShoppingCart, SearchNormal1 } from 'iconsax-reactjs';

const tabs = [
    {
        name: "ホーム",
        href: "/home",
        icon: Home2,
    },
    {
        name: "探索",
        href: "/search",
        icon: SearchNormal1,
    },
    {
        name: "チャット",
        href: "/chat",
        icon: Messages3,
    },
    {
        name: "カート",
        href: "/cart",
        icon: ShoppingCart,
    },
    {
        name: "プロフィール",
        href: "/profile",
        icon: ProfileCircle,
    },
];

export default function BottomTabs() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto">
                <div className="flex justify-around items-center h-16 px-2">
                    {tabs.map((tab) => {
                        const active = isActive(tab.href);
                        const IconComponent = tab.icon;
                        
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className="flex flex-col items-center justify-center min-w-[60px] h-full gap-1 relative group"
                            >
                                {/* Icon with smooth transition */}
                                <div className={`
                                    transition-all duration-300 ease-out
                                    ${active 
                                        ? 'scale-110 -translate-y-0.5' 
                                        : 'scale-100 group-active:scale-90'
                                    }
                                `}>
                                    <IconComponent 
                                        size="24" 
                                        color={active ? "currentColor" : "#6B7280"}
                                        variant={active ? "Bold" : "Linear"}
                                        className={`
                                            transition-colors duration-200
                                            ${active ? 'text-main' : 'text-gray-500 group-hover:text-gray-700'}
                                        `}
                                    />
                                </div>

                                {/* Label */}
                                <span className={`
                                    text-[10px] transition-all duration-200
                                    ${active 
                                        ? 'text-main font-bold' 
                                        : 'text-gray-500 font-medium group-hover:text-gray-700'
                                    }
                                `}>
                                    {tab.name}
                                </span>

                                {/* Active indicator dot/bar */}
                                {active && (
                                    <span className="absolute -bottom-0 w-1 h-1 bg-main rounded-full animate-pulse" />
                                )}

                                {/* Ripple effect on tap */}
                                <span className="absolute inset-0 rounded-lg group-active:bg-gray-100 transition-colors duration-150" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}