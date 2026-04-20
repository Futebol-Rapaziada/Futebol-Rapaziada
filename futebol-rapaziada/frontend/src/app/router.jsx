import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Cadastro     from "../pages/Cadastro";
import Login        from "../pages/Login";
import Home         from "../pages/Home";
import Estatisticas from "../pages/Estatisticas";
import Campeonato   from "../pages/Campeonato";
import Presenca     from "../pages/Presenca";
import Jogos        from "../pages/Jogos";

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  return children;
}

const P = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/"      element={<Cadastro />} />
        <Route path="/login" element={<Login />} />

        {/* Privadas */}
        <Route path="/home"         element={<P><Home /></P>} />
        <Route path="/estatisticas" element={<P><Estatisticas /></P>} />
        <Route path="/campeonato"   element={<P><Campeonato /></P>} />
        <Route path="/presenca"     element={<P><Presenca /></P>} />
        <Route path="/jogos"        element={<P><Jogos /></P>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}