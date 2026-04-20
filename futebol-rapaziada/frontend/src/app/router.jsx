import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Cadastro     from "../pages/Cadastro.jsx";
import Login        from "../pages/Login";
import Home         from "../pages/Home";
import Estatisticas from "../pages/Estatisticas";
import Campeonato   from "../pages/Campeonato";

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas */}
        <Route path="/"      element={<Cadastro />} />
        <Route path="/login" element={<Login />} />

        {/* Privadas */}
        <Route path="/home"         element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/estatisticas" element={<PrivateRoute><Estatisticas /></PrivateRoute>} />
        <Route path="/campeonato"   element={<PrivateRoute><Campeonato /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}