import { InicioSesion } from "./InicioSesion"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CrearCuenta } from "./CrearCuenta";


function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/CrearCuenta" element={<CrearCuenta />} />
        <Route path="/" element={<InicioSesion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
