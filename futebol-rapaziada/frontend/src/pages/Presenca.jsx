import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Presenca.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Presenca() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [atualizando, setAtual]   = useState({});

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    carregar();
  }, []);

  async function carregar() {
    try {
      const data = await getJogadores();
      setJogadores(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Verifica se é o próprio jogador ou admin
  function podeConfirmar(j) {
    return j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase()
      || usuarioLogado?.admin === true
      || usuarioLogado?.admin === 1;
  }

  async function toggleConfirmado(j) {
    setAtual(old => ({ ...old, [j.id]: true }));
    try {
      const token = localStorage.getItem("token");
      const novoStatus = !(j.confirmado === 1 || j.confirmado === true);
      await fetch(`${API_URL}/jogadores/${j.id}/confirmar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ confirmado: novoStatus }),
      });
      await carregar();
    } catch (e) { console.error(e); }
    finally { setAtual(old => ({ ...old, [j.id]: false })); }
  }

  function isConfirmado(j) {
    return j.confirmado === 1 || j.confirmado === true;
  }

  function isEu(j) {
    return j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();
  }

  const confirmados    = jogadores.filter(j => isConfirmado(j));
  const naoConfirmados = jogadores.filter(j => !isConfirmado(j));

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div></div></Layout>;

  return (
    <Layout>
      <div className="pres-wrap">
        <h1 className="page-titulo">Lista de Presença</h1>
        <p className="page-sub">Confirme sua presença para o próximo jogo</p>

        {/* Meu status — destaque */}
        {(() => {
          const eu = jogadores.find(j => isEu(j));
          if (!eu) return null;
          const conf = isConfirmado(eu);
          return (
            <div className={`meu-status ${conf ? "ms-conf" : "ms-nconf"}`}>
              <div className="meus-dados">
                <span className="ms-icon">{conf ? "✅" : "❌"}</span>
                <div>
                  <p className="ms-titulo">Sua presença</p>
                  <p className="ms-sub">{conf ? "Você está confirmado!" : "Você ainda não confirmou"}</p>
                </div>
              </div>
              <button
                className={`btn-confirmar ${conf ? "btn-desconf" : "btn-conf"}`}
                onClick={() => toggleConfirmado(eu)}
                disabled={atualizando[eu.id]}
              >
                {atualizando[eu.id]
                  ? "..."
                  : conf ? "❌ Desconfirmar" : "✅ Confirmar presença"
                }
              </button>
            </div>
          );
        })()}

        {/* Contadores */}
        <div className="pres-contadores">
          <div className="pres-cnt pres-cnt-ok">
            <span className="cnt-num">{confirmados.length}</span>
            <span className="cnt-lbl">Confirmados</span>
          </div>
          <div className="pres-cnt pres-cnt-nd">
            <span className="cnt-num">{naoConfirmados.length}</span>
            <span className="cnt-lbl">Pendentes</span>
          </div>
          <div className="pres-cnt pres-cnt-total">
            <span className="cnt-num">{jogadores.length}</span>
            <span className="cnt-lbl">Total</span>
          </div>
        </div>

        {/* Lista confirmados */}
        <section className="pres-section">
          <h2 className="pres-section-titulo">✅ Confirmados ({confirmados.length})</h2>
          <div className="pres-lista">
            {confirmados.length === 0
              ? <p className="pres-vazio">Nenhum confirmado ainda.</p>
              : confirmados.map(j => (
                <div key={j.id} className={`pres-item pres-ok ${isEu(j) ? "pres-eu" : ""}`}>
                  <span className="pi-avatar">👤</span>
                  <div className="pi-info">
                    <span className="pi-nome">
                      {j.nome?.split(" ")[0]}
                      {isEu(j) && <span className="tag-eu">você</span>}
                    </span>
                    <span className="pi-pos">{j.posicao || "—"}</span>
                  </div>
                  <div className="pi-actions">
                    <span className="pi-status-badge conf">✅ Confirmado</span>
                    {podeConfirmar(j) && (
                      <button
                        className="btn-mini btn-mini-desconf"
                        onClick={() => toggleConfirmado(j)}
                        disabled={atualizando[j.id]}
                      >
                        {atualizando[j.id] ? "..." : "Desconfirmar"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        {/* Lista não confirmados */}
        <section className="pres-section">
          <h2 className="pres-section-titulo">❌ Pendentes ({naoConfirmados.length})</h2>
          <div className="pres-lista">
            {naoConfirmados.length === 0
              ? <p className="pres-vazio">🎉 Todos confirmaram!</p>
              : naoConfirmados.map(j => (
                <div key={j.id} className={`pres-item pres-nd ${isEu(j) ? "pres-eu" : ""}`}>
                  <span className="pi-avatar">👤</span>
                  <div className="pi-info">
                    <span className="pi-nome">
                      {j.nome?.split(" ")[0]}
                      {isEu(j) && <span className="tag-eu">você</span>}
                    </span>
                    <span className="pi-pos">{j.posicao || "—"}</span>
                  </div>
                  <div className="pi-actions">
                    <span className="pi-status-badge nconf">❌ Pendente</span>
                    {podeConfirmar(j) && (
                      <button
                        className="btn-mini btn-mini-conf"
                        onClick={() => toggleConfirmado(j)}
                        disabled={atualizando[j.id]}
                      >
                        {atualizando[j.id] ? "..." : "Confirmar"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        <div className="camp-aviso">
          🚧 Em breve: histórico de presença por jogo e notificações.
        </div>
      </div>
    </Layout>
  );
}