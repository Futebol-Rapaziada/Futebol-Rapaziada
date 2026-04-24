import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../style/Layout.css";

const MENU = [
  { path: "/home",          icon: "🃏", label: "Meu Perfil" },
  { path: "/estatisticas",  icon: "📊", label: "Estatísticas" },
  { path: "/campeonato",    icon: "🏆", label: "Campeonato" },
  { path: "/jogos",         icon: "⚽", label: "Jogos" },
  { path: "/presenca",      icon: "📋", label: "Lista de Presença" },
  { path: "/times",         icon: "👕", label: "Times" },
  { path: "/financeiro",    icon: "💰", label: "Financeiro" },
];

export default function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const usuario   = JSON.parse(localStorage.getItem("user"));
  const [aberto, setAberto] = useState(false);

  function sair() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${aberto ? "aberta" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">FUTEBOL<br /><span className="logo-sub">RAPAZIADA</span></span>
        </div>

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
              {em_breve && <span className="badge-breve">BREVE</span>}
              {location.pathname === path && <span className="item-glow" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {usuario?.nome?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="user-info">
              <p className="user-nome">{usuario?.nome?.split(" ")[0]}</p>
              <p className="user-email">{usuario?.email}</p>
            </div>
          </div>
          <button className="btn-sair" onClick={sair}>⏻ Sair</button>
        </div>
      </aside>

      {aberto && <div className="sidebar-overlay" onClick={() => setAberto(false)} />}

      <div className="layout-main">
        <header className="layout-topbar">
          <button className="menu-toggle" onClick={() => setAberto(!aberto)}>☰</button>
          <span className="topbar-titulo">
            {MENU.find(m => m.path === location.pathname)?.label ?? "Player Card"}
          </span>
          <div className="topbar-right">
            <span className="topbar-user">
              <span className="user-dot" />
              {usuario?.nome?.split(" ")[0]}
            </span>
          </div>
        </header>
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}