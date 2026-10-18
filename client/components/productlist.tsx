import { Product } from '@/types/product'
import { Get } from '@/lib/server';
import ProductCard from './productcard';

export async function ProductList() {
    const products: Product[] = await Get<Product[]>('/products')

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
                <ProductCard key={p.name} name={p.name} price={p.price} description={p.description} inStock={p.inStock} />
            ))}
        </ul>
    )
}