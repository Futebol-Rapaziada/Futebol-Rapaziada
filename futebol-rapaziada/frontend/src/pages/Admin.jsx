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
      // O uso de Date.now() ajuda a evitar que o navegador use dados do cache
      const [rJog, rUsu] = await Promise.all([
        getJogadores(),
        getAdminUsuarios(),
      ]);
      setJogadores(rJog || []);
      setUsuarios(rUsu || []);
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

  // ─── FUNÇÃO SALVAR AJUSTADA (Resolve Erro 500 e Atualização) ───
  async function handleSalvarStats(id, form) {
    try {
      // 1. Convertendo tudo para número (evita erro 500 no Python/Banco)
      const payload = {
        gols: parseInt(form.gols) || 0,
        assistencias: parseInt(form.assistencias) || 0,
        vitorias: parseInt(form.vitorias) || 0,
        empates: parseInt(form.empates) || 0,
        desarmes: parseInt(form.desarmes) || 0,
        defesas: parseInt(form.defesas) || 0,
        cartoes: parseInt(form.cartoes) || 0
      };

      const res = await atualizarStats(id, payload);

      if (res) {
        showMsg("Estatísticas atualizadas com sucesso!");
        // 2. Recarrega os dados imediatamente para mudar no site sem F5
        await carregarDados(); 
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      showMsg("Erro ao salvar estatísticas.", "erro");
    }
  }

  if (loading) return <div className="adm-loading">Carregando painel...</div>;

  return (
    <div className="adm-container">
      <header className="adm-header">
        <h1>Painel Administrativo</h1>
        <button onClick={() => navigate("/")} className="adm-btn-voltar">Sair</button>
      </header>

      <nav className="adm-nav">
        <button className={aba === "overall" ? "active" : ""} onClick={() => setAba("overall")}>Stats/Overall</button>
        <button className={aba === "pagamentos" ? "active" : ""} onClick={() => setAba("pagamentos")}>Financeiro</button>
        <button className={aba === "usuarios" ? "active" : ""} onClick={() => setAba("usuarios")}>Usuários</button>
      </nav>

      {msg.texto && (
        <div className={`adm-alert ${msg.tipo === "erro" ? "adm-alert-erro" : "adm-alert-sucesso"}`}>
          {msg.texto}
        </div>
      )}

      <main className="adm-content">
        {aba === "overall" && (
          <AbaOverall 
            jogadores={jogadores} 
            onSalvar={handleSalvarStats} 
            atualizarOverall={atualizarOverall}
            carregarDados={carregarDados}
          />
        )}
        {aba === "pagamentos" && (
          <AbaPagamentos 
            jogadores={jogadores} 
            confirmar={confirmarPagamento} 
            refresh={carregarDados} 
          />
        )}
        {aba === "usuarios" && <AbaUsuarios usuarios={usuarios} />}
      </main>
    </div>
  );
}

// ─── ABA OVERALL (Ajustada para enviar os dados corretos) ──────────────────────
function AbaOverall({ jogadores, onSalvar, atualizarOverall, carregarDados }) {
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  const iniciarEdicao = (j) => {
    setEditando(j.id_jogador);
    setForm({
      gols: j.gols ?? 0,
      assistencias: j.assistencias ?? 0,
      vitorias: j.vitorias ?? 0,
      empates: j.empates ?? 0,
      desarmes: j.desarmes ?? 0,
      defesas: j.defesas ?? 0,
      cartoes: j.cartoes ?? 0,
      pac: j.pac ?? 0, sho: j.sho ?? 0, pas: j.pas ?? 0,
      dri: j.dri ?? 0, def: j.def ?? 0, phy: j.phy ?? 0
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="adm-overall-grid">
      {jogadores.map(j => (
        <div key={j.id_jogador} className="adm-card">
          <h3>{j.nome}</h3>
          {editando === j.id_jogador ? (
            <div className="adm-form">
              <div className="adm-form-group">
                <label>Gols</label>
                <input type="number" name="gols" value={form.gols} onChange={handleChange} />
                <label>Assists</label>
                <input type="number" name="assistencias" value={form.assistencias} onChange={handleChange} />
                <label>Vitórias</label>
                <input type="number" name="vitorias" value={form.vitorias} onChange={handleChange} />
                <label>Cartões</label>
                <input type="number" name="cartoes" value={form.cartoes} onChange={handleChange} />
              </div>
              <div className="adm-form-actions">
                <button onClick={() => onSalvar(j.id_jogador, form)} className="adm-btn-save">Salvar Stats</button>
                <button onClick={() => setEditando(null)} className="adm-btn-cancel">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="adm-stats-preview">
              <p>⚽ {j.gols || 0} | 🎯 {j.assistencias || 0} | ⭐ {j.vitorias || 0}v</p>
              <button onClick={() => iniciarEdicao(j)} className="adm-btn-edit">Editar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ABA PAGAMENTOS ──────────────────────────────────────────────────────────
function AbaPagamentos({ jogadores, confirmar, refresh }) {
  const [atualizando, setAtualizando] = useState({});

  async function toggle(j) {
    const id = j.id_jogador;
    setAtualizando(prev => ({ ...prev, [id]: true }));
    try {
      await confirmar(id, { pagou: true });
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAtualizando(prev => ({ ...prev, [id]: false }));
    }
  }

  const pendentes = jogadores.filter(j => !j.confirmado);

  return (
    <div>
      <h2 className="adm-section-title">💰 Pagamentos Pendentes</h2>
      <div className="adm-pag-lista">
        {pendentes.length === 0 ? <p>Tudo em dia!</p> : pendentes.map(j => (
          <div key={j.id_jogador} className="adm-pag-row">
            <span>{j.nome}</span>
            <button disabled={atualizando[j.id_jogador]} onClick={() => toggle(j)}>
              {atualizando[j.id_jogador] ? "..." : "Confirmar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABA USUÁRIOS ────────────────────────────────────────────────────────────
function AbaUsuarios({ usuarios }) {
  return (
    <div>
      <h2 className="adm-section-title">👥 Usuários Cadastrados</h2>
      <div className="adm-pag-tabela">
        {usuarios.map((u) => (
          <div key={u.id_usuarios} className="adm-pag-row">
            <span>{u.nome}</span>
            <span>{u.email}</span>
            <span className={`adm-pag-badge ${u.admin ? "pago" : ""}`}>
              {u.admin ? "Admin" : "User"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}