import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // íconos minimalistas

export function PasswordInput() {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative w-full">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                className="w-full border border-[var(--color-light-gray)] rounded-xl px-4 py-2 text-[var(--color-dark-text)] placeholder-[var(--color-gray-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
