import React from "react";

export default function GlobalButton({
    title,
    className
}: React.ComponentProps<"button">) {

    return (
        <button className={`${className} bg-main px-4 py-2 text-white rounded-md`}>
            { title }
        </button>
    )
}
