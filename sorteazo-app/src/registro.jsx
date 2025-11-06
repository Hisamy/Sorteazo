import { Hero } from "./Hero";
import sorteazoLogo from "./assets/sorteazo.svg";
import { ToggleButtonText } from "./ToggleButtonText";
import { InputForm } from "./form-components/InputForm";
import { PasswordInput } from "./form-components/InputPassword"; 

export function Registro({ toggleView }) {
    return (
        <div className="grid grid-cols-3 h-screen ">
            <div>
                <Hero text="Welcome," /> 
            </div>

            <div className="col-start-2 col-end-4 p-10 flex flex-col bg-[var(--color-background)] flex align-center">
                <div className="max-w-sm ">
                    <img
                        src={sorteazoLogo}
                        alt="Sorteazo logo"
                        className="w-1/2 mb-10"
                    />

                    
                </div>
                <ToggleButtonText isCrearCuenta={true} toggleView={toggleView} />
                <div className="flex flex-col gap-15 align-center justify-center">
                    <div>
                       
                        
                    </div>
                    <div className="font-afacad">
                        <form action="#" method="post">
                          
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="nombre">Nombre(s):</label>
                                <InputForm type="text" placeholder="Ingresa tu nombre" />
                            </fieldset>
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="apellido">Apellido(s):</label>
                                <InputForm type="text" placeholder="Ingresa tu apellido" />
                            </fieldset>
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="telefono">Número de teléfono:</label>
                                <InputForm type="tel" placeholder="111-222-333-4" />
                            </fieldset>
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="direccion">Dirección:</label>
                                <InputForm type="text" placeholder="Av. Juarez" />
                            </fieldset>
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="codigopostal">Código postal:</label>
                                <InputForm type="text" placeholder="1111" />
                            </fieldset>

                            
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="contrasena">Contraseña:</label>
                                <PasswordInput placeholder="Crea tu contraseña" />
                            </fieldset>
                            <fieldset className="flex flex-col mb-4">
                                <label htmlFor="confirmarContrasena">Confirmar contraseña:</label>
                                <PasswordInput placeholder="Confirma tu contraseña" />
                            </fieldset>
                            
                            
                            <div className="flex items-start mt-4 mb-6">
                                <input
                                    type="checkbox"
                                    id="terminos"
                                    name="terminos"
                                    className="mr-2 mt-1 accent-[var(--color-primary)]"
                                    required
                                />
                                <label htmlFor="terminos" className="text-xs text-gray-600">
                                    Acepto los **términos y condiciones**
                                    <p className="text-[10px] text-gray-500">Tus datos podrán ser utilizados para enviarte recordatorios de tus sorteos.</p>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="cursor-pointer bg-[var(--color-primary)] text-[var(--color-light-text)] font-afacad w-full py-2 px-[18px] mt-2 rounded-xl hover:bg-green-700 transition-colors"
                            >
                                Regístrarme
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
}