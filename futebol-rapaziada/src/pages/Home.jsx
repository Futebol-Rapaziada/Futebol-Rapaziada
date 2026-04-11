import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";

const mockCards = [
  { icon: "⚽", label: "Gols na temporada",   value: "0",                  cor: "#00e676" },
  { icon: "🎯", label: "Assistências",         value: "0",                  cor: "#40c4ff" },
  { icon: "📅", label: "Próximo jogo",         value: "Sáb, 12 Abr · 15h", cor: "#ffd740" },
  { icon: "💰", label: "Pagamento",            value: "R$ 350,00 pendente", cor: "#ff6d00" },
  { icon: "🏦", label: "Banco",                value: "Pix: (47) 9xxxx",    cor: "#ea80fc" },
  { icon: "✅", label: "Confirmados",          value: "8 / 11 jogadores",   cor: "#69f0ae" },
  { icon: "🏆", label: "Posição no camp.",     value: "3º lugar · 18 pts",  cor: "#ffd740" },
  { icon: "⏱️", label: "Minutos jogados",      value: "0 min",              cor: "#80d8ff" },
];

function getCartaConfig(overall) {
  const n = Number(overall);
  if (n <= 33) return {
    tipo: "BRONZE",
    bg: "linear-gradient(160deg, #4a2800 0%, #cd7f32 40%, #8b5a00 70%, #3d2000 100%)",
    cor: "#ffd4a0",
    brilho: "#cd7f32",
  };
  if (n <= 66) return {
    tipo: "PRATA",
    bg: "linear-gradient(160deg, #2a2a2a 0%, #c0c0c0 40%, #808080 70%, #1a1a1a 100%)",
    cor: "#fff",
    brilho: "#c0c0c0",
  };
  return {
    tipo: "OURO",
    bg: "linear-gradient(160deg, #3a2800 0%, #ffd700 40%, #b8860b 70%, #2a1a00 100%)",
    cor: "#fff8dc",
    brilho: "#ffd700",
  };
}

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dotOpen, setDotOpen] = useState(false);

  const player = JSON.parse(localStorage.getItem("player") || "{}");
  const carta = getCartaConfig(player.overall ?? 50);

  return (
    <div className="home-wrap">

      {/* Menu Lateral */}
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            <div className="side-menu-header">
              <div className="side-avatar" style={player.fotoUrl ? { backgroundImage: `url(${player.fotoUrl})` } : {}} />
              <div>
                <div className="side-nome">{player.nome || "Jogador"}</div>
                <div className="side-posicao">{player.posicao || "—"}</div>
              </div>
            </div>
            {[
              ["👤", "Meu Perfil"],
              ["📊", "Estatísticas"],
              ["📅", "Calendário de Jogos"],
              ["💰", "Financeiro"],
              ["🏆", "Classificação"],
              ["👥", "Time"],
              ["🔔", "Notificações"],
              ["⚙️", "Configurações"],
            ].map(([icon, label]) => (
              <div key={label} className="menu-item">
                <span>{icon}</span>
                <span className="menu-label">{label}</span>
                <span className="menu-arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Três Pontos */}
      {dotOpen && (
        <div className="dot-overlay" onClick={() => setDotOpen(false)}>
          <div className="dot-menu" onClick={(e) => e.stopPropagation()}>
            {[
              { label: "Editar perfil",     action: () => navigate("/") },
              { label: "Compartilhar card", action: () => {} },
              { label: "Histórico de jogos",action: () => {} },
              { label: "Sair",              action: () => { localStorage.clear(); navigate("/"); } },
            ].map(({ label, action }) => (
              <div key={label} className="dot-item" onClick={action}>{label}</div>
            ))}
          </div>
        </div>
      )}

      {/* TopBar */}
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setMenuOpen(true)}>☰</button>
        <span className="app-name">PLAYER CARD</span>
        <button className="icon-btn" onClick={() => setDotOpen(true)}>⋮</button>
      </div>

      {/* ── CARTA FIFA ── */}
      <div className="carta-section">
        <div className="carta" style={{ background: carta.bg, boxShadow: `0 20px 60px ${carta.brilho}44` }}>

          {/* Brilho de canto */}
          <div className="carta-brilho" style={{ background: `radial-gradient(circle at 30% 20%, ${carta.brilho}55, transparent 60%)` }} />

          {/* Topo: overall + posição */}
          <div className="carta-topo">
            <div className="carta-overall" style={{ color: carta.cor }}>{player.overall ?? 50}</div>
            <div className="carta-pos"     style={{ color: carta.cor }}>{player.posicao || "ATA"}</div>
            <div className="carta-tipo"    style={{ color: carta.cor }}>{carta.tipo}</div>
          </div>

          {/* Foto */}
          <div className="carta-foto-wrap">
            <div
              className="carta-foto"
              style={player.fotoUrl ? { backgroundImage: `url(${player.fotoUrl})` } : {}}
            >
              {!player.fotoUrl && <span className="carta-foto-placeholder">👤</span>}
            </div>
          </div>

          {/* Nome */}
          <div className="carta-nome" style={{ color: carta.cor }}>
            {player.nome?.toUpperCase() || "JOGADOR"}
          </div>

          {/* Divisor */}
          <div className="carta-divisor" style={{ background: carta.brilho }} />

          {/* Stats */}
          <div className="carta-stats">
            {[
              { label: "GOL", value: 0 },
              { label: "ASS", value: 0 },
              { label: "JOG", value: 0 },
            ].map(({ label, value }) => (
              <div key={label} className="carta-stat">
                <span className="carta-stat-val" style={{ color: carta.cor }}>{value}</span>
                <span className="carta-stat-key" style={{ color: carta.brilho }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Rodapé: idade + perna */}
          <div className="carta-footer">
            <span style={{ color: carta.cor, opacity: 0.7 }}>
              {player.idade ? `${player.idade} anos` : "—"}
            </span>
            <span style={{ color: carta.brilho }}>⚽</span>
            <span style={{ color: carta.cor, opacity: 0.7 }}>
              {player.perna ? `P. ${player.perna}` : "—"}
            </span>
          </div>

        </div>
      </div>

      {/* Cards */}
      <div className="section">
        <p className="section-title">Resumo da temporada</p>
        <div className="cards-grid">
          {mockCards.map((card) => (
            <div key={card.label} className="card">
              <div className="card-icon">{card.icon}</div>
              <div className="card-label">{card.label}</div>
              <div className="card-value" style={{ color: card.cor }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}