import { InicioSesion } from "./InicioSesion"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CrearCuenta } from "./CrearCuenta";
import { GestorCrearSorteo } from "./GestorCrearSorteo";
import { DashboardOrganizador } from "./DashboardOrganizador";
import { DashboardCliente } from "./DashboardCliente";
import { ConsultaSorteoOrganizador } from "./ConsultaSorteoOrganizador";
import { ConsultaSorteoCliente } from "./ConsultaSorteoCliente";
import { EditarSorteo } from "./editar-sorteo/EditarSorteo";
import { EditarSorteoBoletos } from "./editar-sorteo/EditarSorteoBoletos";
import { EditarSorteoPremios } from "./editar-sorteo/EditarSorteoPremios";


function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/CrearCuenta" element={<CrearCuenta />} />
        <Route path="/CrearSorteo" element={<GestorCrearSorteo />} />
        <Route path="/sorteos/organizador" element={<DashboardOrganizador />} />
        <Route path="/sorteos/cliente" element={<DashboardCliente />} />
        <Route path="/sorteos/organizador/:id" element={<ConsultaSorteoOrganizador />} />
        <Route path="/sorteos/organizador/editar/:id" element={<EditarSorteo />} />
        <Route path="/sorteos/organizador/editar-boletos/:id" element={<EditarSorteoBoletos />} />
        <Route path="/sorteos/organizador/editar-premios/:id" element={<EditarSorteoPremios />} />
        <Route path="/sorteos/cliente/:id" element={<ConsultaSorteoCliente />} />
        <Route path="/" element={<InicioSesion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App