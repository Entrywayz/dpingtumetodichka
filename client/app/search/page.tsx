'use client'

import { useEffect, useState } from "react"
import { Get } from "@/lib/server"

interface ProductResponse {
    id: number
    name: string
    price: number
}

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const trimmed = query.trim()

        if (!trimmed) {
            setProducts([])
            setError(null)
            setLoading(false)
            return
        }

        const controller = new AbortController()
        setLoading(true)
        setError(null)

        const timer = setTimeout(async () => {
            try {
                const data = await Get<ProductResponse[]>(
                    `/products?q=${encodeURIComponent(trimmed)}`
                )
                setProducts(data)
            } catch {
                if (!controller.signal.aborted) {
                    setError("Не удалось загрузить товары")
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }, 300)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [query])

    return (
        <div className="w-full max-w-2xl p-4">
            <h1 className="mb-4 text-2xl font-bold text-white">
                Поиск товаров
            </h1>
            <p className="text-gray-500 mb-6">
                Вы можете найти повар по его id или по его названию
            </p>
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                        />
                    </svg>
                </span>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по имени или ID..."
                    autoFocus
                    className="w-full rounded-xl border border-gray-300 bg-gray-900 py-3 pl-10 pr-10 text-white placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />

                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-600"
                        aria-label="Очистить"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div className="mt-6">
                {loading && (
                    <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                        <svg
                            className="h-5 w-5 animate-spin text-indigo-500"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                        <span>Загрузка...</span>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && query.trim() && products.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                        Ничего не найдено по запросу «{query}»
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm">
                        {products.map((p) => (
                            <li
                                key={p.id}
                                className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-gray-800"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-white">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        id: {p.id}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                                    {p.price} ₽
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}