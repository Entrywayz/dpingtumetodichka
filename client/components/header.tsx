  "use client";

  import { usePathname, useRouter } from "next/navigation";
  import Navbar from "./navbar";
  import { useAuth } from "@/context/AuthContext";

  interface NavItem {
    value: string;
    label: string;
    roles?: string[];
  }

  const ALL_NAV_ITEMS: NavItem[] = [
    { value: "/", label: "Главная" },
    { value: "/products", label: "Телевизоры" },
    { value: "/products/employee", label: "Управление продуктами", roles: ["employee"] },
    { value: "/search", label: "Поиск" },
    { value: "/events", label: "Мероприятия" },
    { value: "/contacts", label: "Контакты" },
    { value: "/faq", label: "FAQ" },
    { value: "/admin", label: "Панель управления", roles: ["admin"] },
    { value: "/orders", label: "Заказы", roles: ["employee"] },
  ];

  export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, loading } = useAuth();

    const filteredItems = ALL_NAV_ITEMS.filter((item) => {
      if (!item.roles) return true; 
      if (!user) return false;    
      return item.roles.includes(user.role);
    });

    const navItems = [
      ...filteredItems,
      ...(!user && !loading ? [{ value: "/login", label: "Авторизация" }] : []),
    ];

    const active =
      navItems
        .slice()
        .sort((a, b) => b.value.length - a.value.length)
        .find((item) =>
          item.value === "/" ? pathname === "/" : pathname.startsWith(item.value)
        )?.value ?? navItems[0].value;

    return (
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <h1 className="text-center text-xl font-bold text-white sm:text-2xl lg:text-left lg:text-3xl">
            Интернет магазин телевизоров
          </h1>

          <div className="flex items-center justify-center gap-4 lg:justify-end">
            <Navbar
              items={navItems}
              value={active}
              onChange={(value) => router.push(value)}
              trackColor="rgba(24, 24, 27, 0.85)"
              thumbColor="#fafafa"
              textColor="#fafafa"
              activeTextColor="#18181b"
              size="md"
              radius={10}
              inset={3}
              equalSlots={false}
              stretch={100}
              squash={3}
              speed={1}
              glide={75}
              draggable
              disabled={false}
              className="max-w-full overflow-x-auto"
            />

            {!loading && user && (
              <div className="flex items-center gap-3 border-l border-white/20 pl-4 text-sm text-white">
                <div className="flex flex-col text-right">
                  <span className="font-semibold text-zinc-300">{user.login}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">{user.role == "employee" ? "Сотрудник" : "Администратор"}</span>
                </div>
                <button
                  onClick={logout}
                  className="rounded bg-red-600/80 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }