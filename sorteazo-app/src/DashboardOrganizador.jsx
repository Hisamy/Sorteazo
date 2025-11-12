import { TopNavBar } from "./util-components/TopNavBar";
import { EmptyStateCard } from "./util-components/EmptyStateCard";
import { StatsCard } from "./util-components/StatsCard";
import { SidebarMenu } from "./util-components/SidebarMenu";
import { useNavigate } from "react-router-dom";
import { Package, DollarSign, Users, TrendingUp } from "lucide-react";

export function DashboardOrganizador() {
    const navigate = useNavigate();

    const handleMenuClick = (itemId) => {
        if (itemId === "logout") {
            navigate("/");
        }
        console.log("Menu item clicked:", itemId);
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar />
            
            <div className="flex">
                <SidebarMenu activeItem="dashboard" onItemClick={handleMenuClick} />
                
                <div className="flex-1 px-8 py-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)] mb-2">
                                Bienvenido Organizador!
                            </h1>
                            <p className="font-afacad text-lg text-[var(--color-gray-text)]">
                                Administra o crea tus sorteos
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/CrearSorteo')}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-light-text)] font-afacad px-6 py-3 rounded-xl transition-colors duration-300 cursor-pointer shadow-md hover:shadow-lg"
                        >
                            Crear sorteo
                        </button>
                    </div>

                    {/* Estadísticas del organizador */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatsCard 
                            icon={Package}
                            label="Sorteos Activos"
                            value="0"
                            color="var(--color-primary)"
                        />
                        
                        <StatsCard 
                            icon={Users}
                            label="Participantes"
                            value="0"
                            color="var(--color-primary)"
                        />
                        
                        <StatsCard 
                            icon={DollarSign}
                            label="Ingresos Totales"
                            value="$0"
                            color="var(--color-primary)"
                        />
                        
                        <StatsCard 
                            icon={TrendingUp}
                            label="Boletos Vendidos"
                            value="0"
                            color="var(--color-primary)"
                        />
                    </div>

                    <div className="mb-6">
                        <h2 className="font-afacad text-2xl font-semibold text-[var(--color-dark-text)] mb-4">
                            Mis Sorteos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <EmptyStateCard 
                            message="Aquí estarán los sorteos del admin"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
