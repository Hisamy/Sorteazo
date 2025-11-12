import { TopNavBar } from "./util-components/TopNavBar";
import { EmptyStateCard } from "./util-components/EmptyStateCard";

export function DashboardCliente() {
    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar showLogout={true} />
            
            <div className="container mx-auto px-8 py-10">
                <div className="mb-8">
                    <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)] mb-2">
                        Bienvenido Cliente!
                    </h1>
                    <p className="font-afacad text-lg text-[var(--color-gray-text)]">
                        Explora y participa en los sorteos disponibles
                    </p>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-afacad text-2xl font-semibold text-[var(--color-dark-text)]">
                            Sorteos Disponibles
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <EmptyStateCard 
                            message="Aquí aparecerán los sorteos disponibles para participar"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
