import React from 'react'

export default function Loading() {
    return (
        <div>
            <div className='flex items-center justify-center py-12 h-screen'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
            </div>
        </div>
    )
}
