import { TopNavBar } from "./util-components/TopNavBar";
import { EmptyStateCard } from "./util-components/EmptyStateCard";
import { useNavigate } from "react-router-dom";

export function DashboardOrganizador() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar showLogout={true} />
            
            <div className="container mx-auto px-8 py-10">
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
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-light-text)] font-afacad px-6 py-3 rounded-xl transition-colors duration-300 cursor-pointer"
                    >
                        Crear sorteo
                    </button>
                </div>

                <div className="mb-8">
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
