import { useState } from "react";
import { Link } from "react-router-dom";


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

                <Link to="/" className={`flex items-center justify-center w-full space-x-[6px] m-1 rounded-[10px] py-2 px-[18px] text-md transition-all duration-200 ${!isIniciarSesion
                    ? 'text-dark-text bg-[var(--color-background)]'
                    : 'text-gray-text'
                    }`}>
                    <span>
                        Iniciar sesión
                    </span>
                </Link>
                <Link to="/CrearCuenta" className={`flex items-center justify-center w-full space-x-[6px] m-1 rounded-[10px] py-2 px-[18px] text-md transition-all duration-200 ${isIniciarSesion
                    ? 'text-dark-text bg-[var(--color-background)]'
                    : 'text-gray-text'
                    }`}>
                    <span>
                        Crear cuenta
                    </span>
                </Link>
            </label>
        </>
    );
}