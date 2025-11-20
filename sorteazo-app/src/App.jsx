import { InicioSesion } from "./InicioSesion"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CrearCuenta } from "./CrearCuenta";
import { GestorCrearSorteo } from "./GestorCrearSorteo";
import { DashboardOrganizador } from "./DashboardOrganizador";
import { DashboardCliente } from "./DashboardCliente";
import { ConsultaSorteoOrganizador } from "./ConsultaSorteoOrganizador";
import { ConsultaSorteoCliente } from "./ConsultaSorteoCliente";


function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/CrearCuenta" element={<CrearCuenta />} />
        <Route path="/CrearSorteo" element={<GestorCrearSorteo />} />
        <Route path="/sorteos/organizador" element={<DashboardOrganizador />} />
        <Route path="/sorteos/cliente" element={<DashboardCliente />} />
        <Route path="/sorteos/organizador/:id" element={<ConsultaSorteoOrganizador />} />
        <Route path="/sorteos/cliente/:id" element={<ConsultaSorteoCliente />} />
        <Route path="/" element={<InicioSesion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App