import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getJogadores, atualizarOverall,
  atualizarStats, confirmarPagamento, getAdminUsuarios,
} from "../services/api";
import "../style/Admin.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Admin() {
  const navigate = useNavigate();
  const [aba, setAba] = useState("overall");
  const [jogadores, setJogadores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ texto: "", tipo: "" });

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [rJog, rUsu] = await Promise.all([
        getJogadores(),
        getAdminUsuarios(),
      ]);
      setJogadores(rJog);
      setUsuarios(rUsu);
    } catch (err) {
      console.error(err);
      showMsg("Erro ao carregar dados.", "erro");
    } finally {
      setLoading(false);
    }
  }

  function showMsg(texto, tipo = "sucesso") {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: "", tipo: "" }), 3000);
  }

  return (
    <div className="adm-wrap">
      <div className="adm-bg">
        <div className="adm-orb orb1" /><div className="adm-orb orb2" />
        <div className="adm-grid-bg" />
      </div>
      <div className="adm-container">
        <div className="adm-header">
          <button className="adm-back" onClick={() => navigate("/home")}>← Voltar</button>
          <div>
            <span className="adm-tagline">🔒 Área Restrita</span>
            <h1 className="adm-titulo">Painel Admin</h1>
          </div>
        </div>

        {msg.texto && (
          <div className={`adm-msg ${msg.tipo}`}>
            {msg.tipo === "sucesso" ? "✓" : "⚠"} {msg.texto}
          </div>
        )}

        <div className="adm-abas">
          {["overall","stats","pagamentos","presenca","usuarios"].map((a) => (
            <button key={a} className={`adm-aba ${aba === a ? "ativo" : ""}`} onClick={() => setAba(a)}>
              {a === "overall"    && "⭐ Overall"}
              {a === "stats"      && "📊 Estatísticas"}
              {a === "pagamentos" && "💰 Pagamentos"}
              {a === "presenca"   && "📋 Presença"}
              {a === "usuarios"   && "👥 Usuários"}
            </button>
          ))}
        </div>

        {loading ? <div className="adm-loading">Carregando...</div> : (
          <div className="adm-content">
            {aba === "overall" && (
              <AbaOverall jogadores={jogadores} onSave={async (id, dados) => {
                try { await atualizarOverall(id, dados); showMsg("Overall atualizado!"); }
                catch { showMsg("Erro ao atualizar overall.", "erro"); }
              }} />
            )}
            {aba === "stats" && (
              <AbaStats jogadores={jogadores} onSave={async (id, dados) => {
                try { await atualizarStats(id, dados); showMsg("Estatísticas atualizadas!"); carregarDados(); }
                catch { showMsg("Erro ao atualizar estatísticas.", "erro"); }
              }} />
            )}
            {aba === "pagamentos" && (
              <AbaPagamentos jogadores={jogadores} onToggle={async (id, pagou) => {
                try { await confirmarPagamento(id, pagou); showMsg(`Pagamento ${pagou ? "confirmado" : "cancelado"}!`); carregarDados(); }
                catch { showMsg("Erro ao atualizar pagamento.", "erro"); }
              }} />
            )}
            {aba === "presenca" && (
              <AbaPresenca
                jogadores={jogadores}
                onToggle={async (j) => {
                  try {
                    const token = localStorage.getItem("token");
                    const novoStatus = !(j.confirmado === 1 || j.confirmado === true);
                    await fetch(`${API_URL}/jogadores/${j.id_jogador ?? j.id}/confirmar`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ confirmado: novoStatus }),
                    });
                    showMsg(`Presença de ${j.nome?.split(" ")[0]} ${novoStatus ? "confirmada" : "removida"}!`);
                    carregarDados();
                  } catch { showMsg("Erro ao atualizar presença.", "erro"); }
                }}
              />
            )}
            {aba === "usuarios" && <AbaUsuarios usuarios={usuarios} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OVERALL ─────────────────────────────────────────────────────────────────
function AbaOverall({ jogadores, onSave }) {
  return (
    <div>
      <h2 className="adm-section-title">⭐ Editar Overall</h2>
      <div className="adm-cards">
        {jogadores.map((j) => <OverallForm key={j.id_jogador||j.id} jogador={j} onSave={onSave} />)}
      </div>
    </div>
  );
}

function OverallForm({ jogador, onSave }) {
  const [vals, setVals] = useState({
    overall: jogador.overall||0, pac: jogador.pac||0, sho: jogador.sho||0,
    pas: jogador.pas||0, dri: jogador.dri||0, def: jogador.def||0, phy: jogador.phy||0,
  });
  const [salvando, setSalvando] = useState(false);

  return (
    <div className="adm-card">
      <div className="adm-card-header">
        {jogador.fotoUrl && <img src={jogador.fotoUrl} alt={jogador.nome} className="adm-card-foto" />}
        <div><p className="adm-card-nome">{jogador.nome}</p><p className="adm-card-pos">{jogador.posicao}</p></div>
        <span className="adm-overall-badge">{vals.overall}</span>
      </div>
      <div className="adm-atributos">
        {["overall","pac","sho","pas","dri","def","phy"].map((k) => (
          <div key={k} className="adm-attr">
            <label className="adm-attr-label">{k.toUpperCase()}</label>
            <input type="number" min="0" max="99" value={vals[k]}
              onChange={(e) => setVals((o) => ({ ...o, [k]: Number(e.target.value) }))}
              className="adm-attr-input" />
          </div>
        ))}
      </div>
      <button className="adm-btn-salvar" disabled={salvando}
        onClick={async () => { setSalvando(true); await onSave(jogador.id_jogador||jogador.id, vals); setSalvando(false); }}>
        {salvando ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function AbaStats({ jogadores, onSave }) {
  return (
    <div>
      <h2 className="adm-section-title">📊 Adicionar Estatísticas</h2>
      <p className="adm-section-obs">Os valores serão somados às estatísticas atuais.</p>
      <div className="adm-cards">
        {jogadores.map((j) => <StatsForm key={j.id_jogador||j.id} jogador={j} onSave={onSave} />)}
      </div>
    </div>
  );
}

function StatsForm({ jogador, onSave }) {
  const empty = { gols:0, assistencias:0, jogos:0, cartoes:0, vitorias:0, empates:0, derrotas:0, desarmes:0, defesas:0 };
  const [vals, setVals] = useState(empty);
  const [salvando, setSalvando] = useState(false);

  const campos = [
    ["gols",        "⚽ Gols"],
    ["assistencias","🎯 Assists"],
    ["jogos",       "🏟 Jogos"],
    ["vitorias",    "🏆 Vitórias"],
    ["empates",     "🤝 Empates"],
    ["derrotas",    "💔 Derrotas"],
    ["desarmes",    "🛡️ Desarmes"],
    ["defesas",     "🧤 Defesas"],
    ["cartoes",     "🟨 Cartões"],
  ];

  return (
    <div className="adm-card">
      <div className="adm-card-header">
        {jogador.fotoUrl && <img src={jogador.fotoUrl} alt={jogador.nome} className="adm-card-foto" />}
        <div><p className="adm-card-nome">{jogador.nome}</p><p className="adm-card-pos">{jogador.posicao}</p></div>
      </div>

      {/* Stats atuais */}
      <div className="adm-stats-atuais">
        <span>⚽ <b>{jogador.gols||0}</b></span>
        <span>🎯 <b>{jogador.assistencias||0}</b></span>
        <span>🏟 <b>{jogador.jogos||0}</b></span>
        <span>🏆 <b>{jogador.vitorias||0}</b></span>
        <span>🤝 <b>{jogador.empates||0}</b></span>
        <span>💔 <b>{jogador.derrotas||0}</b></span>
        <span>🛡️ <b>{jogador.desarmes||0}</b></span>
        <span>🧤 <b>{jogador.defesas||0}</b></span>
        <span>🟨 <b>{jogador.cartoes||0}</b></span>
      </div>

      {/* Grid de inputs — 3 colunas */}
      <div className="adm-atributos adm-atributos-3">
        {campos.map(([k, l]) => (
          <div key={k} className="adm-attr">
            <label className="adm-attr-label">{l}</label>
            <input type="number" min="0" value={vals[k]}
              onChange={(e) => setVals((o) => ({ ...o, [k]: Number(e.target.value) }))}
              className="adm-attr-input" />
          </div>
        ))}
      </div>

      <button className="adm-btn-salvar" disabled={salvando}
        onClick={async () => {
          setSalvando(true);
          await onSave(jogador.id_jogador||jogador.id, vals);
          setVals(empty);
          setSalvando(false);
        }}>
        {salvando ? "Salvando..." : "+ Adicionar"}
      </button>
    </div>
  );
}

// ─── PAGAMENTOS ──────────────────────────────────────────────────────────────
function AbaPagamentos({ jogadores, onToggle }) {
  return (
    <div>
      <h2 className="adm-section-title">💰 Controle de Pagamentos</h2>
      <div className="adm-pag-resumo">
        <div className="adm-pag-stat verde">
          <span className="adm-pag-num">{jogadores.filter(j=>j.pagou).length}</span>
          <span className="adm-pag-label">Pagaram</span>
        </div>
        <div className="adm-pag-stat vermelho">
          <span className="adm-pag-num">{jogadores.filter(j=>!j.pagou).length}</span>
          <span className="adm-pag-label">Pendentes</span>
        </div>
      </div>
      <div className="adm-pag-tabela">
        <div className="adm-pag-thead"><span>Jogador</span><span>Status</span><span>Ação</span></div>
        {jogadores.map((j) => (
          <div key={j.id_jogador||j.id} className="adm-pag-row">
            <div className="adm-pag-jogador">
              {j.fotoUrl && <img src={j.fotoUrl} alt={j.nome} className="adm-pag-foto" />}
              <div><p className="adm-pag-nome">{j.nome}</p><p className="adm-pag-pos">{j.posicao}</p></div>
            </div>
            <span className={`adm-pag-badge ${j.pagou ? "pago" : "pendente"}`}>
              {j.pagou ? "✅ Pago" : "❌ Pendente"}
            </span>
            <button className={`adm-pag-btn ${j.pagou ? "cancelar" : "confirmar"}`}
              onClick={() => onToggle(j.id_jogador||j.id, !j.pagou)}>
              {j.pagou ? "Cancelar" : "Confirmar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRESENÇA ─────────────────────────────────────────────────────────────────
function AbaPresenca({ jogadores, onToggle }) {
  const [atualizando, setAtual] = useState({});
  const confirmados    = jogadores.filter(j => j.confirmado === 1 || j.confirmado === true);
  const naoConfirmados = jogadores.filter(j => !(j.confirmado === 1 || j.confirmado === true));

  async function toggle(j) {
    setAtual(o => ({ ...o, [j.id_jogador ?? j.id]: true }));
    await onToggle(j);
    setAtual(o => ({ ...o, [j.id_jogador ?? j.id]: false }));
  }

  return (
    <div>
      <h2 className="adm-section-title">📋 Lista de Presença</h2>

      {/* Resumo */}
      <div className="adm-pag-resumo">
        <div className="adm-pag-stat verde">
          <span className="adm-pag-num">{confirmados.length}</span>
          <span className="adm-pag-label">Confirmados</span>
        </div>
        <div className="adm-pag-stat vermelho">
          <span className="adm-pag-num">{naoConfirmados.length}</span>
          <span className="adm-pag-label">Pendentes</span>
        </div>
        <div className="adm-pag-stat" style={{ borderColor: "rgba(255,255,255,.1)" }}>
          <span className="adm-pag-num" style={{ color: "var(--text2)" }}>{jogadores.length}</span>
          <span className="adm-pag-label">Total</span>
        </div>
      </div>

      {/* Tabela confirmados */}
      <p className="adm-pres-subtitulo">✅ Confirmados ({confirmados.length})</p>
      <div className="adm-pag-tabela" style={{ marginBottom: "1rem" }}>
        <div className="adm-pag-thead"><span>Jogador</span><span>Status</span><span>Ação</span></div>
        {confirmados.length === 0
          ? <p className="adm-pres-vazio">Nenhum confirmado ainda.</p>
          : confirmados.map(j => {
            const id = j.id_jogador ?? j.id;
            return (
              <div key={id} className="adm-pag-row">
                <div className="adm-pag-jogador">
                  {j.fotoUrl
                    ? <img src={j.fotoUrl} alt={j.nome} className="adm-pag-foto" />
                    : <span className="adm-pres-avatar">👤</span>
                  }
                  <div><p className="adm-pag-nome">{j.nome}</p><p className="adm-pag-pos">{j.posicao || "—"}</p></div>
                </div>
                <span className="adm-pag-badge pago">✅ Confirmado</span>
                <button
                  className="adm-pag-btn cancelar"
                  disabled={atualizando[id]}
                  onClick={() => toggle(j)}
                >
                  {atualizando[id] ? "..." : "Remover"}
                </button>
              </div>
            );
          })
        }
      </div>

      {/* Tabela pendentes */}
      <p className="adm-pres-subtitulo">❌ Pendentes ({naoConfirmados.length})</p>
      <div className="adm-pag-tabela">
        <div className="adm-pag-thead"><span>Jogador</span><span>Status</span><span>Ação</span></div>
        {naoConfirmados.length === 0
          ? <p className="adm-pres-vazio">🎉 Todos confirmaram!</p>
          : naoConfirmados.map(j => {
            const id = j.id_jogador ?? j.id;
            return (
              <div key={id} className="adm-pag-row">
                <div className="adm-pag-jogador">
                  {j.fotoUrl
                    ? <img src={j.fotoUrl} alt={j.nome} className="adm-pag-foto" />
                    : <span className="adm-pres-avatar">👤</span>
                  }
                  <div><p className="adm-pag-nome">{j.nome}</p><p className="adm-pag-pos">{j.posicao || "—"}</p></div>
                </div>
                <span className="adm-pag-badge pendente">❌ Pendente</span>
                <button
                  className="adm-pag-btn confirmar"
                  disabled={atualizando[id]}
                  onClick={() => toggle(j)}
                >
                  {atualizando[id] ? "..." : "Confirmar"}
                </button>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

// ─── USUÁRIOS ────────────────────────────────────────────────────────────────
function AbaUsuarios({ usuarios }) {
  return (
    <div>
      <h2 className="adm-section-title">👥 Usuários Cadastrados</h2>
      <div className="adm-pag-tabela">
        <div className="adm-pag-thead"><span>Nome</span><span>Email</span><span>Admin</span></div>
        {usuarios.map((u) => (
          <div key={u.id_usuarios} className="adm-pag-row">
            <p className="adm-pag-nome">{u.nome}</p>
            <p className="adm-pag-pos">{u.email}</p>
            <span className={`adm-pag-badge ${u.admin ? "pago" : "pendente"}`}>
              {u.admin ? "✅ Admin" : "👤 Usuário"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}