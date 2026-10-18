import RoleGuard from "@/guards/roleguard";

export default function OrdersPage() {
    return (
        <RoleGuard allowedRoles={["employee"]}>
            <section className="text-white flex items-center justify-center">
                <h1 className="text-3xl font-bold">Панель заказов</h1>
            </section>
        </RoleGuard>
    )
}