import { Hero } from "./Hero";
import sorteazoLogo from "./assets/LogoSorteazo-B.svg";
import { ToggleButtonText } from "./ToggleButtonText";
import { InputForm } from "./form-components/InputForm";
import { PasswordInput } from "./form-components/InputPassword";
export function CrearCuenta() {
    return (
        <div className="grid grid-cols-3 h-screen ">
            <div className="fixed top-0 left-0 h-screen w-1/3">
                <Hero
                    header="Bienvenido,"
                    text="por favor ingrese sus datos para crear una cuenta."
                />
            </div>

            <div className="col-start-2 col-end-4  p-10 flex flex-col bg-[var(--color-background)] flex align-center">
                <div className="w-full flex justify-center mb-10">
                    <img
                        src={sorteazoLogo}
                        alt="Sorteazo logo"
                        className="max-h-25"
                    />
                </div>
                <div className="flex flex-col align-center gap-10 px-10 w-full h-full">
                    <div className="w-full max-w-lg mx-auto">
                        <div className="w-full">
                            <ToggleButtonText isCrearCuenta={true} />
                        </div>
                        <div className="font-afacad mt-10 ">
                            <form action="#" method="get">
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Nombres<span className="text-gray-text" >(s)</span></label>
                                    <InputForm
                                        type="text"
                                        placeholder="Ingresa tu nombre"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Apellido<span className="text-gray-text" >(s)</span></label>
                                    <InputForm
                                        type="text"
                                        placeholder="Ingresa tu apellido"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Correo electronico</label>
                                    <InputForm
                                        type="email"
                                        placeholder="tucorreo@ejemplo.com"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Número de teléfono</label>
                                    <InputForm
                                        type="text"
                                        placeholder="111-222-333-4"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Dirección</label>
                                    <InputForm
                                        type="text"
                                        placeholder="Av. Ejemplo"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Código postal</label>
                                    <InputForm
                                        type="text"
                                        placeholder="1111"
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Contraseña</label>
                                    <PasswordInput

                                    />

                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="#">Confirmar contraseña</label>
                                    <PasswordInput

                                    />

                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <div className="flex gap-2">
                                        <div>
                                            <input className="mt-2" type="checkbox" name="" id="" />
                                        </div>

                                        <div >
                                            <label className="text-lg">Acepto los terminos y condiciones</label>
                                            <p className="text-gray-text">Tus datos podrán ser utilizados para enviarte recordatorios de tus sorteos.</p>
                                        </div>

                                    </div>
                                </fieldset>

                                <button
                                    type="submit"
                                    className=" hover:bg-[var(--color-primary-hover)] transition-colors duration-500 cursor-pointer mb-2 bg-[var(--color-primary)] text-[var(--color-light-text)] font-afacad  w-full py-2 px-[18px]  rounded-xl">
                                    Registrarme
                                </button>


                            </form>

                        </div>

                    </div>

                </div>


            </div>
        </div >

    );
}