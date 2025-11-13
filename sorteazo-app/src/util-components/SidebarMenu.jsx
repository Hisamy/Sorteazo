import { Home, Package, Settings, LogOut } from "lucide-react";

export function SidebarMenu({ activeItem = "dashboard", onItemClick }) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "sorteos", label: "Mis Sorteos", icon: Package },
        { id: "configuracion", label: "Configuración", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-[var(--color-light-gray)] min-h-screen p-6">
            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onItemClick?.(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-afacad text-left transition-all duration-200 ${
                                isActive
                                    ? "bg-[var(--color-primary)] text-[var(--color-light-text)]"
                                    : "text-[var(--color-dark-text)] hover:bg-[var(--color-light-gray)]"
                            }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
                
                <div className="pt-4 mt-4 border-t border-[var(--color-light-gray)]">
                    <button
                        onClick={() => onItemClick?.("logout")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-afacad text-left text-[var(--color-dark-text)] hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
