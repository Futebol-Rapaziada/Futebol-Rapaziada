import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Cadastro from "../pages/Cadastro";
import Home from "../pages/Home";

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔒 se não estiver logado → volta pro cadastro
  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Cadastro (público) */}
        <Route path="/" element={<Cadastro />} />

        {/* Home (protegida) */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* Qualquer rota inválida */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}