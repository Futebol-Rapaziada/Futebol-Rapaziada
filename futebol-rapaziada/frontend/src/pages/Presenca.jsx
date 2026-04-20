import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Presenca.css";

export default function Presenca() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirmados, setConf]    = useState({});

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    getJogadores()
      .then(data => {
        setJogadores(data);
        const inicial = {};
        data.forEach(j => { inicial[j.id] = j.confirmado === 1 || j.confirmado === true; });
        setConf(inicial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const confirmadosList = jogadores.filter(j => confirmados[j.id]);
  const naoConfirmados  = jogadores.filter(j => !confirmados[j.id]);

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div></div></Layout>;

  return (
    <Layout>
      <div className="pres-wrap">
        <h1 className="page-titulo">Lista de Presença</h1>
        <p className="page-sub">Próximo jogo — confirmações em andamento</p>

        {/* Contador */}
        <div className="pres-contadores">
          <div className="pres-cnt pres-cnt-ok">
            <span className="cnt-num">{confirmadosList.length}</span>
            <span className="cnt-lbl">Confirmados</span>
          </div>
          <div className="pres-cnt pres-cnt-nd">
            <span className="cnt-num">{naoConfirmados.length}</span>
            <span className="cnt-lbl">Não confirmados</span>
          </div>
          <div className="pres-cnt pres-cnt-total">
            <span className="cnt-num">{jogadores.length}</span>
            <span className="cnt-lbl">Total</span>
          </div>
        </div>

        {/* Lista confirmados */}
        <section className="pres-section">
          <h2 className="pres-section-titulo">✅ Confirmados ({confirmadosList.length})</h2>
          <div className="pres-lista">
            {confirmadosList.length === 0
              ? <p className="pres-vazio">Nenhum confirmado ainda.</p>
              : confirmadosList.map(j => (
                <div key={j.id} className="pres-item pres-ok">
                  <span className="pi-avatar">👤</span>
                  <div className="pi-info">
                    <span className="pi-nome">{j.nome}</span>
                    <span className="pi-pos">{j.posicao || "—"}</span>
                  </div>
                  <span className="pi-status">✅</span>
                </div>
              ))
            }
          </div>
        </section>

        {/* Lista não confirmados */}
        <section className="pres-section">
          <h2 className="pres-section-titulo">❌ Não confirmados ({naoConfirmados.length})</h2>
          <div className="pres-lista">
            {naoConfirmados.length === 0
              ? <p className="pres-vazio">Todos confirmaram!</p>
              : naoConfirmados.map(j => (
                <div key={j.id} className="pres-item pres-nd">
                  <span className="pi-avatar">👤</span>
                  <div className="pi-info">
                    <span className="pi-nome">{j.nome}</span>
                    <span className="pi-pos">{j.posicao || "—"}</span>
                  </div>
                  <span className="pi-status">❌</span>
                </div>
              ))
            }
          </div>
        </section>

        <div className="camp-aviso">🚧 Em breve: confirmação interativa e histórico de presença por jogo.</div>
      </div>
    </Layout>
  );
}
