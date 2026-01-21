// app/search/page.tsx
'use client'

import HeaderBar from '@/components/ui/HeaderBar'
import Image from 'next/image'
import taste from '../assets/imgs/taste/taste-search.png'
import category from '../assets/imgs/category/category-search.png'
import Link from 'next/link'
import BottomTabs from '@/components/ui/BottomTabs'
import { ItemCard } from '@/components/ui/ItemCard'
import { useState, useEffect } from 'react'
import { Product } from '@prisma/client'

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        try {
            const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query)}`)
            
            if (!response.ok) {
                console.error('Failed to fetch suggestions')
                return
            }
            
            const data = await response.json()
            setSuggestions(data.suggestions || [])
            setShowSuggestions(data.suggestions?.length > 0)
        } catch (err) {
            console.error('Error fetching suggestions:', err)
            setSuggestions([])
            setShowSuggestions(false)
        }
    }


    // Debounce search to avoid too many API calls
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                searchProducts(searchQuery)
            } else {
                setProducts([])
            }
        }, 500) // Wait 500ms after user stops typing

        return () => clearTimeout(delayDebounce)
    }, [searchQuery])

    const searchProducts = async (query: string) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
            
            if (!response.ok) {
                throw new Error('検索に失敗しました')
            }
            
            const data = await response.json()
            setProducts(data.products || [])

            console.log("this is", data);
        } catch (err) {
            console.error('Search error:', err)
            setError('検索中にエラーが発生しました')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            searchProducts(searchQuery)
        }
    }

    return (
        <div className='px-3 pb-24'>
            <HeaderBar title='検索'/>

            {/* image */}
            <div className='flex justify-center gap-4'>
                <Link href="/category" className='w-40 h-40 relative'>
                    <Image
                        src={category || 'no-image'}
                        alt='Category-Image'
                        fill
                        objectFit='contain'
                    />
                </Link>
                <Link href="/taste" className='w-40 h-40 relative'>
                    <Image
                        src={taste || 'no-image'}
                        alt='Taste-Image'
                        fill
                        objectFit='contain'
                    />
                </Link>
            </div>

            {/* search-filter */}
            <div className='mt-8'>
                <form onSubmit={handleSubmit}>
                    <div className='relative'>
                        <input 
                            type="text" 
                            placeholder='商品検索'
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                fetchSuggestions(e.target.value)
                            }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className='border-b border-b-text w-full py-2 pr-10 focus:outline-none focus:border-main'
                        />
                        {/* Add suggestions dropdown after input */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className='absolute z-10 w-full bg-white rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto'>
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSearchQuery(suggestion)
                                            setShowSuggestions(false)
                                            searchProducts(suggestion)
                                        }}
                                        className='w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0'
                                    >
                                        <i className="fa-solid fa-search text-gray-400 mr-2"></i>
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('')
                                    setProducts([])
                                }}
                                className='absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Search Results */}
            <div className='mt-6'>
                {isLoading && (
                    <p className='text-center text-gray-500'>検索中...</p>
                )}

                {error && (
                    <p className='text-center text-red-500'>{error}</p>
                )}

                {!isLoading && !error && searchQuery && products.length === 0 && (
                    <p className='text-center text-gray-500'>
                        「{searchQuery}」に一致する商品が見つかりませんでした
                    </p>
                )}

                {!isLoading && products.length > 0 && (
                    <>
                        <p className='text-sm text-gray-600 mb-4'>
                            {products.length}件の商品が見つかりました
                        </p>
                        <div className='grid grid-cols-2 gap-4'>
                            {products.map((product) => (
                                <ItemCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    description={product.description}
                                    images={product.images}
                                    category={product.category}
                                    taste={product.taste}
                                    stock={product.stock}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <BottomTabs/>
        </div>
    )
}