import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores, deletarJogador } from "../services/api";
import "../style/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [jogadores, setJogadores] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const usuarioLogado = JSON.parse(localStorage.getItem("user"));
  const player = jogadores[playerIndex] || {};

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/");
      return;
    }
    carregarJogadores();
  }, []);

  async function carregarJogadores() {
    try {
      const data = await getJogadores();
      setJogadores(data);

      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const index = data.findIndex((j) => j.id === user.id);
        if (index !== -1) setPlayerIndex(index);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function proximoPlayer() {
    setPlayerIndex((prev) => (prev + 1) % jogadores.length);
  }

  function anteriorPlayer() {
    setPlayerIndex((prev) =>
      prev === 0 ? jogadores.length - 1 : prev - 1
    );
  }

  async function handleDelete() {
    if (!player.id) return;
    if (!window.confirm(`Deletar ${player.nome}?`)) return;

    await deletarJogador(player.id);

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id === player.id) {
      localStorage.removeItem("user");
      navigate("/");
      return;
    }
    carregarJogadores();
  }

  function sair() {
    localStorage.removeItem("user");
    navigate("/");
  }

  const isOwner = usuarioLogado?.id === player.id;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-ball">⚽</div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="home-wrap">

      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-logo">⚽ PLAYER CARD</div>
        <div className="top-actions">
          <span className="top-user">Olá, {usuarioLogado?.nome?.split(" ")[0]}</span>
          <button className="btn-sair" onClick={sair}>Sair</button>
        </div>
      </header>

      {/* Navegação */}
      <div className="nav-players">
        <button className="nav-btn" onClick={anteriorPlayer}>‹</button>
        <span className="nav-count">{playerIndex + 1} / {jogadores.length}</span>
        <button className="nav-btn" onClick={proximoPlayer}>›</button>
      </div>

      {/* Card do Jogador */}
      <div className="card-wrap">
        <div className="player-card">

          {/* Topo do card */}
          <div className="card-top">
            <div className="card-overall">{player.overall || "—"}</div>
            <div className="card-pos">{player.posicao || "—"}</div>
            <div className="card-flag">🇧🇷</div>
          </div>

          {/* Foto */}
          <div className="card-photo">
            {player.fotoUrl ? (
              <img src={player.fotoUrl} alt={player.nome} />
            ) : (
              <div className="card-photo-placeholder">👤</div>
            )}
          </div>

          {/* Nome */}
          <div className="card-name">
            {player.nome?.split(" ")[0]?.toUpperCase() || "JOGADOR"}
          </div>

          {/* Divisor */}
          <div className="card-divider" />

          {/* Stats */}
          <div className="card-stats">
            <div className="stat">
              <span className="stat-val">{player.gols ?? 0}</span>
              <span className="stat-lbl">GOL</span>
            </div>
            <div className="stat">
              <span className="stat-val">{player.assistencias ?? 0}</span>
              <span className="stat-lbl">ASS</span>
            </div>
            <div className="stat">
              <span className="stat-val">{player.jogos ?? 0}</span>
              <span className="stat-lbl">JOG</span>
            </div>
            <div className="stat">
              <span className="stat-val">{player.cartoes ?? 0}</span>
              <span className="stat-lbl">CAR</span>
            </div>
          </div>

        </div>
      </div>

      {/* Infos extras */}
      <div className="player-info">
        <div className="info-item">
          <span className="info-lbl">Time</span>
          <span className="info-val">{player.time || "Sem time"}</span>
        </div>
        <div className="info-item">
          <span className="info-lbl">Idade</span>
          <span className="info-val">{player.idade ?? "—"}</span>
        </div>
        <div className="info-item">
          <span className="info-lbl">Perna boa</span>
          <span className="info-val">{player.perna_boa || "—"}</span>
        </div>
      </div>

      {/* Ações */}
      {isOwner && (
        <div className="card-actions">
          <button className="btn-delete" onClick={handleDelete}>
            🗑 Deletar meu perfil
          </button>
        </div>
      )}

    </div>
  );
}