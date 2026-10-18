import { Suspense } from 'react'
import { ProductList } from '@/components/productlist'

function Skeleton() {
    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <li
                    key={i}
                    className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="h-5 flex-1 rounded bg-white/10" />
                        <div className="h-6 w-20 rounded-full bg-white/10" />
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default function ProductsPage() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-10 text-white">
            <header className="mb-8">
                <h1 className="bg-linear-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                    Телевизоры
                </h1>
                <p className="mt-2 text-sm text-white/50">
                    Актуальные модели и цены
                </p>
            </header>

            <Suspense fallback={<Skeleton />}>
                <ProductList />
            </Suspense>
        </section>
    )
}