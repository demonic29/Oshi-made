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
}) => {

    if(href){
        return (
            <Link href={href} onClick={onClick} className={`${className} w-full rounded-full  py-3`}>
                {children}
            </Link>
        )
    }

    return(
        <button onClick={onClick} className={`${className} w-full rounded-full  py-3`}>
            {children}
        </button>
    )
}

export default Button;
