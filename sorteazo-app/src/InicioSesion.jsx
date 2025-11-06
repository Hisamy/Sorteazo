import { Hero } from "./Hero";
import sorteazoLogo from "./assets/sorteazo.svg"
import { ToggleButtonText } from "./ToggleButtonText";
import { InputForm } from "./form-components/InputForm";
import { PasswordInput } from "./form-components/InputPassword";
export function InicioSesion() {
    return (
        <div className="grid grid-cols-3 h-screen ">
            <div className="fixed top-0 left-0 h-screen w-1/3">
                <Hero
                    header="Hola de nuevo,"
                    text="por favor ingrese sus detalles de cuenta."

                />
            </div>

            <div className="col-start-2 col-end-4  p-10 flex flex-col bg-[var(--color-background)] flex align-center">
                <div className="w-full flex justify-center mb-10">
                    <img
                        src={sorteazoLogo}
                        alt="Sorteazo logo"
                        className="max-w-50"
                    />
                </div>
                <div className="flex flex-col align-center mt-10 gap-10 px-10 w-full h-full">
                    <div className="w-full max-w-lg mx-auto">
                        <div className="w-full">
                            <ToggleButtonText isCrearCuenta={false} />
                        </div>
                        <div className="font-afacad mt-20 ">
                            <form action="#" method="get">
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Correo Electrónico</label>
                                    <InputForm
                                        type="email"
                                        placeholder="tucorreo@ejemplo.com"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Contraseña</label>
                                    <PasswordInput

                                    />

                                </fieldset>

                                <button
                                    type="submit"
                                    className=" hover:bg-[var(--color-primary-hover)] transition-colors duration-500 cursor-pointer mb-2 bg-[var(--color-primary)] text-[var(--color-light-text)] font-afacad  w-full py-2 px-[18px]  rounded-xl">
                                    Continuar
                                </button>


                            </form>
                            <div>
                                <a href="#" target="_self" rel="noopener noreferrer" className="hover:text-[var(--color-primary-hover)] transition-colors duration-300 cursor-pointer">
                                    ¿Olvidaste tu Contraseña?
                                </a>
                            </div>
                        </div>

                    </div>

                </div>


            </div>
        </div >

    );
}