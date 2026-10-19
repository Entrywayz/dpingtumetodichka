import { Client } from "./client";
import { Employee } from "./employee";
import { Product } from "./product";

export interface Order {
    id: number
    product: Product
    employee: Employee
    client: Client
    placed_at: Date | null
    completed_at: Date | null

}