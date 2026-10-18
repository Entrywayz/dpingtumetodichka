import RoleGuard from "@/guards/roleguard";

export default function EmployeePanelPage() {
    return (
        <RoleGuard allowedRoles={["employee"]}>
            <section className="text-white">
                Employee panel
            </section>
        </RoleGuard>
    )
}