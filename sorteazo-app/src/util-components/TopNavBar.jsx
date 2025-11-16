import sorteazoLogo from "../assets/LogoSorteazo-W.svg";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopNavBar({ showLogout = false }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <header className="w-full bg-[var(--color-primary)] py-4 px-8 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <img
                    src={sorteazoLogo}
                    alt="Sorteazo logo"
                    className="h-15"
                />
                {showLogout && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-[var(--color-light-text)] hover:text-[var(--color-light-gray)] font-afacad transition-colors duration-300"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                )}
            </div>
        </header>
    );
}
