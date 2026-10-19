
export interface ProductCardProps {
    name: string
    price: string
    description: string | null
    inStock: number
}

export default function ProductCard({ name, price, description, inStock }: ProductCardProps) {
    return (
        <li
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/20"
        >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-tight text-white">
                        {name}
                    </h3>
                    <span className={`shrink-0 rounded-full ${Number(inStock) <= 0 ? "text-red-600 ring-red-600" : "text-emerald-300 ring-emerald-300" } px-3 py-1 text-sm font-medium ring-1 ring-inset`}>
                        {price.toLocaleString()} ₽
                    </span>
                </div>
        </li>
    )
}