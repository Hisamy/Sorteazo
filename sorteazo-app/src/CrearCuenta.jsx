import { Hero } from "./Hero";
import sorteazoLogo from "./assets/LogoSorteazo-B.svg"
import { ToggleButtonText } from "./ToggleButtonText.jsx";
import { InputForm } from "./form-components/InputForm.jsx";
import { PasswordInput } from "./form-components/InputPassword";
import { useState } from "react";
import { registrarUsuario } from "./controllers/UsuarioController";


export function CrearCuenta() {
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        zipCode: "",
        password: "",
        confirmarPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await registrarUsuario(formData);
            alert("Cuenta creada con éxito");
            console.log("Usuario creado:", result);
        } catch (error) {
            alert(error.message || "Hubo un error al crear la cuenta");
            console.error(error);
        }
    };
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
                            <form onSubmit={handleSubmit}>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="name">Nombres<span className="text-gray-text">(s)</span></label>
                                    <InputForm
                                        type="text"
                                        name="name"
                                        placeholder="Ingresa tu nombre"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </fieldset>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="lastName">Apellido<span className="text-gray-text">(s)</span></label>
                                    <InputForm
                                        type="text"
                                        name="lastName"
                                        placeholder="Ingresa tu apellido"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </fieldset>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="email">Correo electrónico</label>
                                    <InputForm
                                        type="email"
                                        name="email"
                                        placeholder="tucorreo@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="phone">Teléfono</label>
                                    <InputForm
                                        type="text"
                                        name="phone"
                                        placeholder="111-222-333-4"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </fieldset>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="address">Dirección</label>
                                    <InputForm
                                        type="text"
                                        name="address"
                                        placeholder="Av. Juarez"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </fieldset>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="zipCode">Código postal</label>
                                    <InputForm
                                        type="text"
                                        name="zipCode"
                                        placeholder="1111"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                    />
                                </fieldset>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="password">Contraseña</label>
                                    <PasswordInput
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </fieldset>

                                <fieldset className="flex flex-col mb-5">
                                    <label htmlFor="confirmarPassword">Confirmar contraseña</label>
                                    <PasswordInput
                                        name="confirmarPassword"
                                        value={formData.confirmarPassword}
                                        onChange={handleChange}
                                    />
                                </fieldset>
                                <fieldset className="flex flex-col mb-5">
                                    <div className="flex gap-2">
                                        <div>
                                            <input className="mt-2" type="checkbox" name="terminosCondiciones" id="" />
                                        </div >

                                        <div >
                                            <label className="text-lg">Acepto los terminos y condiciones</label>
                                            <p className="text-gray-text">Tus datos podrán ser utilizados para enviarte recordatorios de tus sorteos.</p>
                                        </div>

                                    </div >
                                </fieldset >

                                <button
                                    type="submit"
                                    className="hover:bg-[var(--color-primary-hover)] transition-colors duration-500 cursor-pointer mb-2 bg-[var(--color-primary)] text-[var(--color-light-text)] font-afacad w-full py-2 px-[18px] rounded-xl"
                                >
                                    Registrarme
                                </button>
                            </form >

                        </div >

                    </div >

                </div >


            </div >
        </div >

    );
}