import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../style/Layout.css";

const MENU = [
  { path: "/home",         icon: "🃏", label: "Meu Perfil" },
  { path: "/estatisticas", icon: "📊", label: "Estatísticas" },
  { path: "/campeonato",   icon: "🏆", label: "Campeonato" },
  { path: "/lista-presenca", icon: "📋", label: "Lista de Presença", em_breve: true },
  { path: "/times",        icon: "👕", label: "Times",        em_breve: true },
  { path: "/financeiro",   icon: "💰", label: "Financeiro",   em_breve: true },
  { path: "/midias",       icon: "🎥", label: "Mídias",       em_breve: true },
];

export default function Layout({ children }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const usuario    = JSON.parse(localStorage.getItem("user"));
  const [aberto, setAberto] = useState(false);

  function sair() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="layout">

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${aberto ? "aberta" : ""}`}>
        <div className="sidebar-logo">⚽ <span>PLAYER CARD</span></div>

        <nav className="sidebar-nav">
          {MENU.map(({ path, icon, label, em_breve }) => (
            <Link
              key={path}
              to={em_breve ? "#" : path}
              className={`sidebar-item ${location.pathname === path ? "ativo" : ""} ${em_breve ? "em-breve" : ""}`}
              onClick={() => setAberto(false)}
            >
              <span className="sidebar-icon">{icon}</span>
              <span className="sidebar-label">{label}</span>
              {em_breve && <span className="badge-breve">Em breve</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar">👤</span>
            <div>
              <p className="sidebar-nome">{usuario?.nome?.split(" ")[0]}</p>
              <p className="sidebar-email">{usuario?.email}</p>
            </div>
          </div>
          <button className="sidebar-sair" onClick={sair}>Sair</button>
        </div>
      </aside>

      {/* overlay mobile */}
      {aberto && <div className="sidebar-overlay" onClick={() => setAberto(false)} />}

      {/* ── CONTEÚDO ── */}
      <div className="layout-main">
        <header className="layout-topbar">
          <button className="menu-toggle" onClick={() => setAberto(!aberto)}>☰</button>
          <span className="topbar-titulo">
            {MENU.find(m => m.path === location.pathname)?.label ?? "Player Card"}
          </span>
          <span className="topbar-user">Olá, {usuario?.nome?.split(" ")[0]}</span>
        </header>

        <main className="layout-content">
          {children}
        </main>
      </div>

    </div>
  );
}
