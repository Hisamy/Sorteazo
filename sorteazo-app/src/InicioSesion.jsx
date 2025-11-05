import { Hero } from "./Hero";
import sorteazoLogo from "./assets/sorteazo.svg"
import { ToggleButtonText } from "./ToggleButtonText";
import { InputForm } from "./form-components/InputForm";
import { PasswordInput } from "./form-components/InputPassword";
export function InicioSesion() {
    return (
        <div className="grid grid-cols-3 h-screen ">
            <div>
                <Hero text="Welcome back," />
            </div>

            <div className="col-start-2 col-end-4  p-10 flex flex-col bg-[var(--color-background)] flex align-center">
                <div className="max-w-sm ">
                    <img
                        src={sorteazoLogo}
                        alt="Sorteazo logo"
                        className="w-1/2 mb-10"
                    />
                </div>
                <div className="flex flex-col gap-15 align-center justify-center">
                    <div>
                        <ToggleButtonText isCrearCuenta={false} />
                    </div>
                    <div className="font-afacad">
                        <form action="#" method="get">
                            <fieldset className="flex flex-col">
                                <label htmlFor="#">Correo Electrónico</label>
                                <InputForm
                                    type="text"
                                    placeholder="tucorreo@ejemplo.com"
                                />
                            </fieldset>
                            <fieldset className="flex flex-col">
                                <label htmlFor="#">Contraseña</label>
                                <PasswordInput

                                />

                            </fieldset>

                            <button
                                type="submit"
                                className=" cursor-pointer bg-[var(--color-primary)] text-[var(--color-light-text)] font-afacad  w-full py-2 px-[18px] mt-5 rounded-xl">
                                Continuar
                            </button>


                        </form>
                    </div>

                </div>


            </div>
        </div >

    );
}