import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores, deletarJogador } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Home.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

const POSICOES = [
  "Goleiro", "Zagueiro", "Lateral Direito",
  "Lateral Esquerdo", "Meia", "Centroavante",
];

export default function Home() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const [player, setPlayer]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [painelAberto, setPainel] = useState(false);
  const [salvando, setSalvando]   = useState(false);
  const [sucesso, setSucesso]     = useState("");
  const [erro, setErro]           = useState("");

  const [form, setForm] = useState({
    nome: "", posicao: "", idade: "",
    perna_boa: "Direita", fotoUrl: "",
    gols: 0, assistencias: 0, jogos: 0, cartoes: 0,
  });

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    carregarJogador();
  }, []);

  async function carregarJogador() {
    try {
      const todos = await getJogadores();
      const meu = todos.find(
        (j) => j.nome?.toLowerCase() === usuarioLogado.nome?.toLowerCase()
      );
      if (meu) {
        setPlayer(meu);
        setForm({
          nome:         meu.nome         ?? "",
          posicao:      meu.posicao      ?? "",
          idade:        meu.idade        ?? "",
          perna_boa:    meu.perna_boa    ?? "Direita",
          fotoUrl:      meu.fotoUrl      ?? "",
          gols:         meu.gols         ?? 0,
          assistencias: meu.assistencias ?? 0,
          jogos:        meu.jogos        ?? 0,
          cartoes:      meu.cartoes      ?? 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handle = (campo) => (e) =>
    setForm((old) => ({ ...old, [campo]: e.target.value }));

  function ajustarStat(campo, delta) {
    setForm((old) => ({
      ...old,
      [campo]: Math.max(0, Number(old[campo]) + delta),
    }));
  }

  async function salvar() {
    if (!player) return;
    setSalvando(true); setErro(""); setSucesso("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/jogadores/${player.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome:         form.nome,
          posicao:      form.posicao,
          idade:        Number(form.idade),
          perna_boa:    form.perna_boa,
          fotoUrl:      form.fotoUrl,
          gols:         Number(form.gols),
          assistencias: Number(form.assistencias),
          jogos:        Number(form.jogos),
          cartoes:      Number(form.cartoes),
        }),
      });
      if (!res.ok) throw new Error();
      setSucesso("Perfil atualizado!");
      await carregarJogador();
      setTimeout(() => { setSucesso(""); setPainel(false); }, 1500);
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDelete() {
    if (!player?.id) return;
    if (!window.confirm("Deletar seu perfil?")) return;
    await deletarJogador(player.id);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  }

  if (loading) return (
    <Layout>
      <div className="loading-screen"><div className="loading-ball">⚽</div><p>Carregando...</p></div>
    </Layout>
  );

  if (!player) return (
    <Layout>
      <div className="loading-screen"><p>Nenhum perfil encontrado.</p></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="home-inner">

        {/* Card */}
        <div className="card-wrap">
          <div className="player-card">
            <div className="card-top">
              <div className="card-overall">{player.overall || "—"}</div>
              <div className="card-pos">{player.posicao || "—"}</div>
              <div className="card-flag">🇧🇷</div>
            </div>

            <div className="card-photo">
              {player.fotoUrl
                ? <img src={player.fotoUrl} alt={player.nome} />
                : <div className="card-photo-placeholder">👤</div>
              }
            </div>

            <div className="card-name">{player.nome?.split(" ")[0]?.toUpperCase()}</div>
            <div className="card-divider" />

            <div className="card-stats">
              {[
                { val: player.gols ?? 0,         lbl: "GOL" },
                { val: player.assistencias ?? 0,  lbl: "ASS" },
                { val: player.jogos ?? 0,         lbl: "JOG" },
                { val: player.cartoes ?? 0,        lbl: "CAR" },
              ].map(({ val, lbl }) => (
                <div className="stat" key={lbl}>
                  <span className="stat-val">{val}</span>
                  <span className="stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infos */}
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

        <div className="home-actions">
          <button className="btn-perfil" onClick={() => setPainel(true)}>✏️ Editar Perfil</button>
          <button className="btn-delete" onClick={handleDelete}>🗑 Deletar meu perfil</button>
        </div>

      </div>

      {/* Painel de edição */}
      {painelAberto && (
        <div className="overlay" onClick={() => setPainel(false)}>
          <div className="painel" onClick={(e) => e.stopPropagation()}>
            <div className="painel-header">
              <h2>Editar Perfil</h2>
              <button className="painel-close" onClick={() => setPainel(false)}>✕</button>
            </div>

            <div className="painel-section">
              <p className="painel-label">Dados</p>
              <label className="painel-field-label">Nome</label>
              <input className="painel-input" value={form.nome} onChange={handle("nome")} />
              <label className="painel-field-label">URL da foto</label>
              <input className="painel-input" placeholder="https://..." value={form.fotoUrl} onChange={handle("fotoUrl")} />
              <label className="painel-field-label">Posição</label>
              <select className="painel-input" value={form.posicao} onChange={handle("posicao")}>
                {POSICOES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <div className="painel-row">
                <div className="painel-col">
                  <label className="painel-field-label">Idade</label>
                  <input className="painel-input" type="number" min="5" max="99" value={form.idade} onChange={handle("idade")} />
                </div>
                <div className="painel-col">
                  <label className="painel-field-label">Perna boa</label>
                  <select className="painel-input" value={form.perna_boa} onChange={handle("perna_boa")}>
                    <option>Direita</option><option>Esquerda</option><option>Ambas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="painel-section">
              <p className="painel-label">Estatísticas</p>
              <p className="painel-obs">⚽ Overall só pode ser alterado pela administração.</p>
              {[
                { key: "gols",         label: "Gols" },
                { key: "assistencias", label: "Assistências" },
                { key: "jogos",        label: "Jogos" },
                { key: "cartoes",      label: "Cartões" },
              ].map(({ key, label }) => (
                <div className="stat-row" key={key}>
                  <span className="stat-row-label">{label}</span>
                  <div className="stat-controls">
                    <button className="stat-btn" onClick={() => ajustarStat(key, -1)}>−</button>
                    <span className="stat-row-val">{form[key]}</span>
                    <button className="stat-btn" onClick={() => ajustarStat(key, +1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {erro    && <div className="msg erro">⚠ {erro}</div>}
            {sucesso && <div className="msg sucesso">✓ {sucesso}</div>}

            <button className="btn-salvar" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
