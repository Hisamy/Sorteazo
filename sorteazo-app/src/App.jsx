import { InicioSesion } from "./InicioSesion"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CrearCuenta } from "./CrearCuenta";
import { GestorCrearSorteo } from "./GestorCrearSorteo";
import { DashboardOrganizador } from "./DashboardOrganizador";
import { DashboardCliente } from "./DashboardCliente";


function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/CrearCuenta" element={<CrearCuenta />} />
        <Route path="/CrearSorteo" element={<GestorCrearSorteo />} />
        <Route path="/dashboard/organizador" element={<DashboardOrganizador />} />
        <Route path="/dashboard/cliente" element={<DashboardCliente />} />
        <Route path="/" element={<InicioSesion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
