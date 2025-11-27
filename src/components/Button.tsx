import Link from "next/link";
import React from "react";

type ButtonProps = {
    onClick?: () => void;
    className?: string;
    href?: string;
    children: React.ReactNode
    title?: string
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    className,
    href,
    title
}) => {

    if(href){
        return (
            <Link href={href} onClick={onClick} className={`${className} block px-[110px] w-full rounded-lg py-3`}>
                {children}
            </Link>
        )
    }

    return(
        <button onClick={onClick} className={`${className}  px-[110px] w-full rounded-lg py-3`}>
            {children}
        </button>
    )
}

export default Button;
