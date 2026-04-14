import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarios, deletarUsuario } from "../services/api";
import "../style/Home.css";

const mockCards = [
  { icon: "⚽", label: "Gols na temporada", value: "2", cor: "#00e676" },
  { icon: "🎯", label: "Assistências", value: "4", cor: "#40c4ff" },
  { icon: "📅", label: "Próximo jogo", value: "Sex, 17hrs", cor: "#ffd740" },
  { icon: "💰", label: "Pagamento", value: "R$ 180,00 pendente", cor: "#ff6d00" },
  { icon: "🏦", label: "Banco", value: "Pix: (48) 9 8813-7485", cor: "#ea80fc" },
  { icon: "✅", label: "Confirmados", value: "8 / 11 jogadores", cor: "#69f0ae" },
  { icon: "🏆", label: "Posição no camp.", value: "3º lugar · 18 pts", cor: "#ffd740" },
  { icon: "⏱️", label: "Minutos jogados", value: "0 min", cor: "#80d8ff" },
];

// CONFIG CARTA
function getCartaConfig(overall) {
  const n = overall ?? 80;

  if (n <= 33) {
    return {
      tipo: "BRONZE",
      bg: "linear-gradient(160deg, #4a2800 0%, #cd7f32 40%, #8b5a00 70%, #3d2000 100%)",
      cor: "#ffd4a0",
      brilho: "#cd7f32",
    };
  }

  if (n <= 66) {
    return {
      tipo: "PRATA",
      bg: "linear-gradient(160deg, #2a2a2a 0%, #c0c0c0 40%, #808080 70%, #1a1a1a 100%)",
      cor: "#fff",
      brilho: "#c0c0c0",
    };
  }

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

  const [usuarios, setUsuarios] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const player = usuarios[playerIndex] || {};
  const carta = getCartaConfig(player.overall);

  // 🔥 BUSCAR API
  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 TROCAR PLAYER
  function proximoPlayer() {
    if (usuarios.length === 0) return;
    setPlayerIndex((prev) => (prev + 1) % usuarios.length);
  }

  function anteriorPlayer() {
    if (usuarios.length === 0) return;
    setPlayerIndex((prev) =>
      prev === 0 ? usuarios.length - 1 : prev - 1
    );
  }

  // 🔥 DELETAR
  async function handleDelete() {
    if (!player.id) return;

    await deletarUsuario(player.id);
    carregarUsuarios();
  }

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Carregando...</p>;
  }

  return (
    <div className="home-wrap">

      {/* MENU LATERAL */}
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            <div className="side-menu-header">
              <div
                className="side-avatar"
                style={player.fotoUrl ? { backgroundImage: `url(${player.fotoUrl})` } : {}}
              />
              <div>
                <div className="side-nome">{player.nome || "Jogador"}</div>
                <div className="side-posicao">{player.posicao || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENU 3 PONTOS */}
      {dotOpen && (
        <div className="dot-overlay" onClick={() => setDotOpen(false)}>
          <div className="dot-menu" onClick={(e) => e.stopPropagation()}>
            <div className="dot-item" onClick={() => navigate("/")}>
              Editar perfil
            </div>
            <div className="dot-item" onClick={handleDelete}>
              Deletar jogador
            </div>
            <div
              className="dot-item"
              onClick={() => {
                setPlayerIndex(0);
              }}
            >
              Voltar início
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setMenuOpen(true)}>☰</button>
        <span className="app-name">PLAYER CARD</span>
        <button className="icon-btn" onClick={() => setDotOpen(true)}>⋮</button>
      </div>

      {/* CARTA */}
      <div className="carta-section">
        <div
          className="carta"
          style={{
            background: carta.bg,
            boxShadow: `0 20px 60px ${carta.brilho}44`,
          }}
        >
          <div className="carta-topo">
            <div className="carta-overall">{player.overall ?? 50}</div>
            <div className="carta-pos">{player.posicao || "ATA"}</div>
            <div className="carta-tipo">{carta.tipo}</div>
          </div>

          <div className="carta-foto-wrap">
            <div
              className="carta-foto"
              style={player.fotoUrl ? { backgroundImage: `url(${player.fotoUrl})` } : {}}
            >
              {!player.fotoUrl && <span>👤</span>}
            </div>
          </div>

          <div className="carta-nome">
            {player.nome?.toUpperCase() || "JOGADOR"}
          </div>

          <div className="carta-stats">
            <div>
              <strong>{player.gols ?? 0}</strong>
              <span>GOL</span>
            </div>
            <div>
              <strong>{player.assistencias ?? 0}</strong>
              <span>ASS</span>
            </div>
            <div>
              <strong>{player.jogos ?? 0}</strong>
              <span>JOG</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÕES TROCA */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <button onClick={anteriorPlayer}>⬅️</button>
        <button onClick={proximoPlayer}>➡️</button>
      </div>

      {/* CARDS */}
      <div className="section">
        <p className="section-title">Resumo da temporada</p>
        <div className="cards-grid">
          {mockCards.map((card) => (
            <div key={card.label} className="card">
              <div className="card-icon">{card.icon}</div>
              <div className="card-label">{card.label}</div>
              <div className="card-value" style={{ color: card.cor }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}