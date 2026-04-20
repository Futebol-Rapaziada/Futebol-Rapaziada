import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores, deletarJogador } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Home.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

const POSICOES = ["Goleiro","Zagueiro","Lateral Direito","Lateral Esquerdo","Meia","Centroavante"];

function getTipoCard(overall) {
  const ovr = Number(overall ?? 0);
  if (ovr >= 67) return "lenda";
  if (ovr >= 34) return "ouro";
  return "bronze";
}

function getRatingColor(val) {
  const v = Number(val ?? 0);
  if (v >= 70) return "#4ade80";
  if (v >= 50) return "#facc15";
  return "#f87171";
}

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
    nome: "", posicao: "", idade: "", perna_boa: "Direita", fotoUrl: "",
    gols: 0, assistencias: 0, jogos: 0, cartoes: 0,
  });

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    carregarJogador();
  }, []);

  async function carregarJogador() {
    try {
      const todos = await getJogadores();
      const meu = todos.find(j => j.nome?.toLowerCase() === usuarioLogado.nome?.toLowerCase());
      if (meu) {
        setPlayer(meu);
        setForm({
          nome: meu.nome ?? "", posicao: meu.posicao ?? "",
          idade: meu.idade ?? "", perna_boa: meu.perna_boa ?? "Direita",
          fotoUrl: meu.fotoUrl ?? "", gols: meu.gols ?? 0,
          assistencias: meu.assistencias ?? 0, jogos: meu.jogos ?? 0, cartoes: meu.cartoes ?? 0,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const handle = (campo) => (e) => setForm(old => ({ ...old, [campo]: e.target.value }));

  function ajustarStat(campo, delta) {
    setForm(old => ({ ...old, [campo]: Math.max(0, Number(old[campo]) + delta) }));
  }

  async function salvar() {
    if (!player) return;
    setSalvando(true); setErro(""); setSucesso("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/jogadores/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          nome: form.nome, posicao: form.posicao, idade: Number(form.idade),
          perna_boa: form.perna_boa, fotoUrl: form.fotoUrl,
          gols: Number(form.gols), assistencias: Number(form.assistencias),
          jogos: Number(form.jogos), cartoes: Number(form.cartoes),
        }),
      });
      if (!res.ok) throw new Error();
      setSucesso("Perfil atualizado!");
      await carregarJogador();
      setTimeout(() => { setSucesso(""); setPainel(false); }, 1500);
    } catch { setErro("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleDelete() {
    if (!player?.id || !window.confirm("Deletar seu perfil?")) return;
    await deletarJogador(player.id);
    localStorage.removeItem("user"); localStorage.removeItem("token");
    navigate("/");
  }

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div><p>Carregando...</p></div></Layout>;
  if (!player) return <Layout><div className="loading-screen"><p>Nenhum perfil encontrado.</p></div></Layout>;

  const tipo = getTipoCard(player.overall);

  const atributos = [
    { key: "pac", label: "PAC", val: player.pac ?? 0 },
    { key: "sho", label: "SHO", val: player.sho ?? 0 },
    { key: "pas", label: "PAS", val: player.pas ?? 0 },
    { key: "dri", label: "DRI", val: player.dri ?? 0 },
    { key: "def", label: "DEF", val: player.def ?? 0 },
    { key: "phy", label: "PHY", val: player.phy ?? 0 },
  ];

  const confirmado = player.confirmado === 1 || player.confirmado === true;

  return (
    <Layout>
      <div className="home-inner">

        {/* ── LINHA PRINCIPAL: carta + info ── */}
        <div className="home-main-row">

          {/* CARTA FIFA */}
          <div className="card-wrap">
            <div className={`player-card card-${tipo}`}>

              {/* Backgrounds por tier */}
              {tipo === "lenda" && (
                <div className="card-bg-lenda">
                  <div className="lenda-orb lenda-orb1" />
                  <div className="lenda-orb lenda-orb2" />
                  <div className="lenda-estrela">✦</div>
                </div>
              )}
              {tipo === "ouro" && (
                <div className="card-bg-ouro">
                  <div className="ouro-shape ouro-s1" />
                  <div className="ouro-shape ouro-s2" />
                  <div className="ouro-shape ouro-s3" />
                </div>
              )}
              {tipo === "bronze" && (
                <div className="card-bg-bronze">
                  <div className="bronze-line bronze-l1" />
                  <div className="bronze-line bronze-l2" />
                </div>
              )}

              {/* Topo */}
              <div className="card-top">
                <div className="card-overall">{player.overall || "0"}</div>
                <div className="card-pos">{player.posicao || "—"}</div>
                <div className="card-flag">🇧🇷</div>
              </div>

              {/* Foto */}
              <div className="card-photo">
                {player.fotoUrl
                  ? <img src={player.fotoUrl} alt={player.nome} />
                  : <div className="card-photo-placeholder">👤</div>
                }
              </div>

              {/* Nome */}
              <div className="card-name">{player.nome?.split(" ")[0]?.toUpperCase()}</div>

              <div className="card-divider" />

              {/* Atributos FIFA: PAC SHO PAS | DRI DEF PHY */}
              <div className="card-atributos">
                <div className="atrib-col">
                  {atributos.slice(0, 3).map(a => (
                    <div key={a.key} className="atrib-item">
                      <span className="atrib-val" style={{ color: getRatingColor(a.val) }}>{a.val}</span>
                      <span className="atrib-lbl">{a.label}</span>
                    </div>
                  ))}
                </div>
                <div className="atrib-divider" />
                <div className="atrib-col">
                  {atributos.slice(3).map(a => (
                    <div key={a.key} className="atrib-item">
                      <span className="atrib-val" style={{ color: getRatingColor(a.val) }}>{a.val}</span>
                      <span className="atrib-lbl">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Badge tier */}
            <div className={`card-tier-badge tier-${tipo}`}>
              {tipo === "lenda"  && "⭐ Lenda · 67–99"}
              {tipo === "ouro"   && "🥇 Ouro · 34–66"}
              {tipo === "bronze" && "🔩 Comum · 0–33"}
            </div>
          </div>

          {/* INFO LATERAL */}
          <div className="home-info-col">

            {/* Nome completo + posição */}
            <div className="info-header">
              <h1 className="info-nome">{player.nome}</h1>
              <div className="info-tags">
                <span className="tag-posicao">{player.posicao || "—"}</span>
                <span className="tag-perna">🦵 {player.perna_boa || "—"}</span>
                <span className="tag-idade">🎂 {player.idade || "—"} anos</span>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="quick-stats">
              {[
                { icone: "⚽", val: player.gols ?? 0,        lbl: "Gols" },
                { icone: "🎯", val: player.assistencias ?? 0, lbl: "Assistências" },
                { icone: "🏟", val: player.jogos ?? 0,        lbl: "Jogos" },
                { icone: "🟨", val: player.cartoes ?? 0,      lbl: "Cartões" },
                { icone: "🔥", val: (player.gols ?? 0) + (player.assistencias ?? 0), lbl: "G+A" },
                { icone: "⭐", val: player.overall ?? 0,      lbl: "Overall" },
              ].map(({ icone, val, lbl }) => (
                <div key={lbl} className="quick-stat-item">
                  <span className="qs-icone">{icone}</span>
                  <span className="qs-val">{val}</span>
                  <span className="qs-lbl">{lbl}</span>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="home-actions">
              <button className="btn-perfil" onClick={() => setPainel(true)}>✏️ Editar Perfil</button>
              <button className="btn-delete" onClick={handleDelete}>🗑 Deletar</button>
            </div>

          </div>
        </div>

        {/* ── CARDS INFORMATIVOS ── */}
        <div className="info-cards-grid">

          {/* Card: Time */}
          <div className="info-card">
            <div className="info-card-header">
              <span>👕</span><h3>Time</h3>
            </div>
            <div className="info-card-body">
              <p className="info-card-val">{player.time || "Sem time"}</p>
            </div>
          </div>

          {/* Card: Confirmado pro jogo */}
          <div className={`info-card ${confirmado ? "info-card-green" : "info-card-red"}`}>
            <div className="info-card-header">
              <span>{confirmado ? "✅" : "❌"}</span>
              <h3>Próximo Jogo</h3>
            </div>
            <div className="info-card-body">
              <p className="info-card-val">{confirmado ? "Confirmado" : "Não confirmado"}</p>
            </div>
          </div>

          {/* Card: Campeonato */}
          <div className="info-card">
            <div className="info-card-header">
              <span>🏆</span><h3>Campeonato</h3>
            </div>
            <div className="info-card-body">
              <p className="info-card-val">Temporada 2026</p>
              <p className="info-card-sub">Modo Carreira</p>
            </div>
          </div>

          {/* Card: Desempenho */}
          <div className="info-card">
            <div className="info-card-header">
              <span>📈</span><h3>Desempenho</h3>
            </div>
            <div className="info-card-body">
              <div className="desempenho-row">
                <span className="desemp-lbl">Média de gols</span>
                <span className="desemp-val">
                  {player.jogos > 0 ? (player.gols / player.jogos).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="desempenho-row">
                <span className="desemp-lbl">Média de assist.</span>
                <span className="desemp-val">
                  {player.jogos > 0 ? (player.assistencias / player.jogos).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="desempenho-row">
                <span className="desemp-lbl">G+A por jogo</span>
                <span className="desemp-val">
                  {player.jogos > 0
                    ? (((player.gols ?? 0) + (player.assistencias ?? 0)) / player.jogos).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── PAINEL DE EDIÇÃO ── */}
      {painelAberto && (
        <div className="overlay" onClick={() => setPainel(false)}>
          <div className="painel" onClick={e => e.stopPropagation()}>
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
                {POSICOES.map(p => <option key={p}>{p}</option>)}
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
              <p className="painel-obs">⚽ Overall e atributos FIFA são definidos pela administração.</p>
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