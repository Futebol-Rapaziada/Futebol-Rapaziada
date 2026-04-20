import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api.js";
import Layout from "../components/layout/Layout.jsx";
import "../style/Estatisticas.css";

const ABAS = ["Geral", "Artilheiro", "Garçom", "Participação", "Defesa", "Presença"];

export default function Estatisticas() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aba, setAba]             = useState("Geral");

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    getJogadores()
      .then(setJogadores)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const porGols         = [...jogadores].sort((a, b) => (b.gols ?? 0) - (a.gols ?? 0));
  const porAssistencias = [...jogadores].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  const porParticipacao = [...jogadores].sort((a, b) =>
    ((b.gols ?? 0) + (b.assistencias ?? 0)) - ((a.gols ?? 0) + (a.assistencias ?? 0))
  );
  const porJogos    = [...jogadores].sort((a, b) => (b.jogos ?? 0) - (a.jogos ?? 0));
  const porCartoes  = [...jogadores].sort((a, b) => (b.cartoes ?? 0) - (a.cartoes ?? 0));
  const porOverall  = [...jogadores].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));

  function medalha(i) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}º`;
  }

  function isEu(j) {
    return j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();
  }

  function posicaoNo(lista) {
    const idx = lista.findIndex(j => isEu(j));
    return idx >= 0 ? `${idx + 1}º` : "—";
  }

  function RankingCard({ titulo, icone, lista, renderVal }) {
    return (
      <div className="ranking-card">
        <div className="ranking-card-header">
          <span>{icone}</span>
          <h3>{titulo}</h3>
        </div>
        <div className="ranking-lista">
          {lista.slice(0, 10).map((j, i) => (
            <div key={j.id ?? i} className={`ranking-item ${isEu(j) ? "eu" : ""}`}>
              <span className="rank-pos">{medalha(i)}</span>
              <div className="rank-info">
                <span className="rank-nome">
                  {j.nome?.split(" ")[0]}
                  {isEu(j) && <span className="tag-eu">você</span>}
                </span>
                <span className="rank-posicao">{j.posicao || "—"}</span>
              </div>
              <span className="rank-val">{renderVal(j)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const eu = jogadores.find(j => isEu(j));

  if (loading) return (
    <Layout>
      <div className="loading-screen"><div className="loading-ball">⚽</div><p>Carregando...</p></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="estat-wrap">

        {/* Minhas stats */}
        {eu && (
          <section className="meus-stats">
            <h2 className="sect-titulo">Minhas Estatísticas</h2>
            <div className="meu-perfil-row">
              <div className="meu-perfil-id">
                <span className="meu-overall">{eu.overall ?? 0}</span>
                <div>
                  <p className="meu-nome">{eu.nome?.split(" ")[0]}</p>
                  <p className="meu-pos">{eu.posicao || "—"}</p>
                </div>
              </div>
              <div className="stat-boxes">
                {[
                  { icone: "⚽", val: eu.gols,         lbl: "Gols" },
                  { icone: "🎯", val: eu.assistencias,  lbl: "Assistências" },
                  { icone: "🔥", val: (eu.gols ?? 0) + (eu.assistencias ?? 0), lbl: "G+A" },
                  { icone: "🏟", val: eu.jogos,         lbl: "Jogos" },
                  { icone: "🟨", val: eu.cartoes,       lbl: "Cartões" },
                  { icone: "⭐", val: eu.overall,       lbl: "Overall" },
                ].map(({ icone, val, lbl }) => (
                  <div key={lbl} className="stat-box">
                    <span className="stat-box-icone">{icone}</span>
                    <span className="stat-box-val">{val ?? 0}</span>
                    <span className="stat-box-lbl">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="meus-posicoes">
              <span>🥇 Artilheiro: <strong>{posicaoNo(porGols)}</strong></span>
              <span>🎯 Garçom: <strong>{posicaoNo(porAssistencias)}</strong></span>
              <span>🔥 Participação: <strong>{posicaoNo(porParticipacao)}</strong></span>
              <span>🏟 Presença: <strong>{posicaoNo(porJogos)}</strong></span>
            </div>
          </section>
        )}

        {/* Abas */}
        <div className="abas">
          {ABAS.map(a => (
            <button key={a} className={`aba-btn ${aba === a ? "ativa" : ""}`} onClick={() => setAba(a)}>
              {a}
            </button>
          ))}
        </div>

        {/* Rankings */}
        <div className="rankings-grid">

          {aba === "Geral" && (
            <>
              <RankingCard titulo="Artilheiros"    icone="⚽" lista={porGols}         renderVal={j => `${j.gols ?? 0} G`} />
              <RankingCard titulo="Garçons"         icone="🎯" lista={porAssistencias} renderVal={j => `${j.assistencias ?? 0} A`} />
              <RankingCard titulo="Participações"   icone="🔥" lista={porParticipacao} renderVal={j => `${(j.gols ?? 0) + (j.assistencias ?? 0)} G+A`} />
              <RankingCard titulo="Mais Jogos"      icone="🏟" lista={porJogos}        renderVal={j => `${j.jogos ?? 0} JG`} />
              <RankingCard titulo="Cartões"         icone="🟨" lista={porCartoes}      renderVal={j => `${j.cartoes ?? 0} C`} />
              <RankingCard titulo="Overall"         icone="⭐" lista={porOverall}      renderVal={j => `${j.overall ?? 0} OVR`} />
            </>
          )}

          {aba === "Artilheiro" && (
            <RankingCard titulo="Artilheiros" icone="⚽" lista={porGols} renderVal={j => `${j.gols ?? 0} gols`} />
          )}

          {aba === "Garçom" && (
            <RankingCard titulo="Garçons" icone="🎯" lista={porAssistencias} renderVal={j => `${j.assistencias ?? 0} ass.`} />
          )}

          {aba === "Participação" && (
            <RankingCard
              titulo="Participação (G+A)" icone="🔥"
              lista={porParticipacao}
              renderVal={j => `${(j.gols ?? 0) + (j.assistencias ?? 0)} G+A`}
            />
          )}

          {aba === "Defesa" && (
            <RankingCard
              titulo="Menos Cartões" icone="🧱"
              lista={[...jogadores].filter(j => (j.jogos ?? 0) > 0).sort((a, b) => (a.cartoes ?? 0) - (b.cartoes ?? 0))}
              renderVal={j => `${j.cartoes ?? 0} cart.`}
            />
          )}

          {aba === "Presença" && (
            <RankingCard titulo="Mais Jogos" icone="🏟" lista={porJogos} renderVal={j => `${j.jogos ?? 0} jogos`} />
          )}

        </div>
      </div>
    </Layout>
  );
}