import { useState, useEffect } from "react";
import { TopNavBar } from "./util-components/TopNavBar";
import { EmptyStateCard } from "./util-components/EmptyStateCard";
import { useNavigate } from "react-router-dom";
import CardSorteoOrganizador from "./consulta-sorteo-components/CardSorteoOrganizador";
import sorteoImage from './assets/images/sorteo-placeholder.png';
import { obtenerSorteosPorOrganizador } from "./services/SorteazoApi";
import { eliminaSorteo } from "./controllers/SorteoController";
import Swal from 'sweetalert2';

export function DashboardOrganizador() {
    const navigate = useNavigate();

    const [sorteos, setSorteos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cargarMisSorteos = async () => {
            try {
                setLoading(true);
                const data = await obtenerSorteosPorOrganizador();
                const sorteosMapeados = data.map(sorteo => {
                    const fullImageUrl = sorteo.imageUrl
                        ? `${import.meta.env.VITE_API_URL}${sorteo.imageUrl}`
                        : sorteoImage;

                    return {
                        id: sorteo.id,
                        title: sorteo.title || '',
                        ticketPrice: sorteo.ticketPrice,
                        raffleDateTime: sorteo.raffleDateTime,
                        imageUrl: fullImageUrl
                    };
                });
                setSorteos(sorteosMapeados);
            } catch (err) {
                console.error("Error al cargar los sorteos:", err);
            } finally {
                setLoading(false);
            }
        };

        cargarMisSorteos();
    }, []);

    const handleDelete = async (id) => {
        const sorteoEliminar = sorteos.find(s => s.id === id);
        const nombreSorteo = sorteoEliminar ? sorteoEliminar.title : "este sorteo";

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Desea eliminar el sorteo "${nombreSorteo}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Rojo para indicar peligro/borrar
            cancelButtonColor: '#6B8E78', // Tu verde para cancelar (o gris si prefieres)
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eliminaSorteo(id);
                    setSorteos(prevSorteos => prevSorteos.filter(s => s.id !== id));

                    Swal.fire({
                        title: '¡Eliminado!',
                        text: `El sorteo "${nombreSorteo}" ha sido eliminado correctamente.`,
                        icon: 'success',
                        confirmButtonColor: '#6B8E78'
                    });

                } catch (error) {
                    console.error("Error al eliminar:", error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al intentar eliminar el sorteo.',
                        icon: 'error',
                        confirmButtonColor: '#6B8E78'
                    });
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar showLogout={true} />

            <div className="container mx-auto px-8 py-10 max-w-4xl">
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

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <p> cargando...</p>
                        </div>
                    ) : (
                        sorteos.length > 0 ? (
                            sorteos.map(sorteo => (
                                <CardSorteoOrganizador
                                    key={sorteo.id}
                                    sorteo={sorteo}
                                    onDelete={handleDelete}
                                    onClick={() => navigate(`/sorteos/organizador/${sorteo.id}`)}
                                    onEdit={() => navigate(`/sorteos/organizador/editar/${sorteo.id}`)}
                                    onNotification={() => navigate(`/sorteos/organizador/configurar-notificaciones/${sorteo.id}`)}

                                />
                            ))
                        ) : (
                            <EmptyStateCard
                                message="No tienes sorteos activos. ¡Crea uno para empezar!"
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
