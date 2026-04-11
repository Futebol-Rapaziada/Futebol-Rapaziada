import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cadastro from "../pages/Cadastro";
import Home from "../pages/Home";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cadastro />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}