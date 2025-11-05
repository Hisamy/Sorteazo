import { useState } from "react";

export function ToggleButtonText({ isCrearCuenta }) {
    const [isIniciarSesion, setIsIniciarSesion] = useState(isCrearCuenta);

    const handleCheckboxChange = () => {
        setIsIniciarSesion(!isIniciarSesion)
    }


    return (
        <>
            <label className="font-afacad flex cursor-pointer select-none items-center justify-center rounded-[10px] bg-[var(--color-light-gray)]">

                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isIniciarSesion}
                    onChange={handleCheckboxChange}
                />

                <span
                    className={`flex items-center justify-center w-full space-x-[6px] m-1 rounded-[10px] py-2 px-[18px] text-md transition-all duration-200 ${!isIniciarSesion
                        ? 'text-dark-text bg-[var(--color-background)]'
                        : 'text-gray-text'
                        }`}
                >
                    Iniciar sesión
                </span>

                <span
                    className={`flex items-center justify-center w-full space-x-[6px] m-1 rounded-[10px] py-2 px-[18px] text-md transition-all duration-200 ${isIniciarSesion
                        ? 'text-dark-text bg-[var(--color-background)]'
                        : 'text-gray-text'
                        }`}
                >
                    Crear cuenta
                </span>
            </label>
        </>
    );
}