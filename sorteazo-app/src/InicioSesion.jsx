import { Hero } from "./Hero";
import sorteazoLogo from "./assets/LogoSorteazo-B.svg";
import { ToggleButtonText } from "./ToggleButtonText";
import { InputForm } from "./form-components/InputForm";
import { PasswordInput } from "./form-components/InputPassword";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { iniciarSesion } from "./controllers/UsuarioController";

export function InicioSesion() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await iniciarSesion(formData);
            console.log("Login exitoso:", response);
            
            // Redirigir según el rol del usuario
            if (response.user?.role === "ORGANIZADOR" || response.user?.role === "organizador") {
                navigate("/DashboardOrganizador");
            } else if (response.user?.role === "CLIENTE" || response.user?.role === "cliente") {
                navigate("/DashboardCliente");
            } else {
                // Si no hay rol definido, redirigir a cliente por defecto
                navigate("/DashboardCliente");
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Hubo un error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

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
                        className="max-h-25"
                    />
                </div>
                <div className="flex flex-col align-center gap-10 px-10 w-full h-full">
                    <div className="w-full max-w-lg mx-auto">
                        <div className="w-full">
                            <ToggleButtonText isCrearCuenta={false} />
                        </div>
                        <div className="font-afacad mt-20 ">
                            <form onSubmit={handleSubmit}>
                                <fieldset className="flex flex-col mb-5">
                                    <label>Correo Electrónico</label>
                                    <InputForm
                                        type="email"
                                        name="email"
                                        placeholder="tucorreo@ejemplo.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label>Contraseña</label>
                                    <PasswordInput
                                        value={formData.password}
                                        name="password"
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
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