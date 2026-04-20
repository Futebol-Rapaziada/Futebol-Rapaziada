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

  // Ordenações
  const porGols         = [...jogadores].sort((a, b) => (b.gols ?? 0)         - (a.gols ?? 0));
  const porAssistencias = [...jogadores].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  const porParticipacao = [...jogadores].sort((a, b) =>
    ((b.gols ?? 0) + (b.assistencias ?? 0)) - ((a.gols ?? 0) + (a.assistencias ?? 0))
  );
  const porJogos        = [...jogadores].sort((a, b) => (b.jogos ?? 0)        - (a.jogos ?? 0));
  const porCartoes      = [...jogadores].sort((a, b) => (b.cartoes ?? 0)      - (a.cartoes ?? 0));
  const porOverall      = [...jogadores].sort((a, b) => (b.overall ?? 0)      - (a.overall ?? 0));

  function medalha(i) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}º`;
  }

  function isEu(j) {
    return j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();
  }

  function RankingCard({ titulo, icone, lista, campo, label }) {
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
              <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
              <span className="rank-val">{j[campo] ?? 0} <span className="rank-lbl">{label}</span></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Meus números
  const eu = jogadores.find(j => isEu(j));

  function StatBox({ label, valor, icone }) {
    return (
      <div className="stat-box">
        <span className="stat-box-icone">{icone}</span>
        <span className="stat-box-val">{valor ?? 0}</span>
        <span className="stat-box-lbl">{label}</span>
      </div>
    );
  }

  function posicaoNo(lista, campo) {
    const idx = lista.findIndex(j => isEu(j));
    return idx >= 0 ? `${idx + 1}º` : "—";
  }

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
            <div className="stat-boxes">
              <StatBox label="Gols"         valor={eu.gols}         icone="⚽" />
              <StatBox label="Assistências" valor={eu.assistencias} icone="🎯" />
              <StatBox label="Participações" valor={(eu.gols ?? 0) + (eu.assistencias ?? 0)} icone="🔥" />
              <StatBox label="Jogos"        valor={eu.jogos}        icone="🏟" />
              <StatBox label="Cartões"      valor={eu.cartoes}      icone="🟨" />
              <StatBox label="Overall"      valor={eu.overall}      icone="⭐" />
            </div>
            <div className="meus-posicoes">
              <span>Artilheiro: <strong>{posicaoNo(porGols, "gols")}</strong></span>
              <span>Garçom: <strong>{posicaoNo(porAssistencias, "assistencias")}</strong></span>
              <span>Participação: <strong>{posicaoNo(porParticipacao, "participacao")}</strong></span>
              <span>Presença: <strong>{posicaoNo(porJogos, "jogos")}</strong></span>
            </div>
          </section>
        )}

        {/* Abas */}
        <div className="abas">
          {ABAS.map((a) => (
            <button
              key={a}
              className={`aba-btn ${aba === a ? "ativa" : ""}`}
              onClick={() => setAba(a)}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}
        <div className="rankings-grid">

          {(aba === "Geral") && (
            <>
              <RankingCard titulo="Artilheiros"    icone="⚽" lista={porGols}         campo="gols"         label="gols" />
              <RankingCard titulo="Garçons"         icone="🎯" lista={porAssistencias} campo="assistencias" label="ass" />
              <RankingCard titulo="Participações"   icone="🔥" lista={porParticipacao} campo="gols"         label="G+A" />
              <RankingCard titulo="Mais jogos"      icone="🏟" lista={porJogos}        campo="jogos"        label="jogos" />
              <RankingCard titulo="Cartões"         icone="🟨" lista={porCartoes}      campo="cartoes"      label="cart." />
              <RankingCard titulo="Ranking Overall" icone="⭐" lista={porOverall}      campo="overall"      label="OVR" />
            </>
          )}

          {(aba === "Artilheiro") && (
            <RankingCard titulo="Artilheiros" icone="⚽" lista={porGols} campo="gols" label="gols" />
          )}

          {(aba === "Garçom") && (
            <RankingCard titulo="Garçons" icone="🎯" lista={porAssistencias} campo="assistencias" label="assistências" />
          )}

          {(aba === "Participação") && (
            <div className="ranking-card">
              <div className="ranking-card-header"><span>🔥</span><h3>Participação (G+A)</h3></div>
              <div className="ranking-lista">
                {porParticipacao.slice(0, 10).map((j, i) => (
                  <div key={j.id ?? i} className={`ranking-item ${isEu(j) ? "eu" : ""}`}>
                    <span className="rank-pos">{medalha(i)}</span>
                    <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
                    <span className="rank-val">
                      {(j.gols ?? 0) + (j.assistencias ?? 0)}
                      <span className="rank-lbl"> G+A</span>
                      <span className="rank-detail"> ({j.gols ?? 0}G {j.assistencias ?? 0}A)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(aba === "Defesa") && (
            <div className="ranking-card">
              <div className="ranking-card-header"><span>🧱</span><h3>Menos Cartões (Defesa)</h3></div>
              <div className="ranking-lista">
                {[...jogadores]
                  .filter(j => (j.jogos ?? 0) > 0)
                  .sort((a, b) => (a.cartoes ?? 0) - (b.cartoes ?? 0))
                  .slice(0, 10)
                  .map((j, i) => (
                    <div key={j.id ?? i} className={`ranking-item ${isEu(j) ? "eu" : ""}`}>
                      <span className="rank-pos">{medalha(i)}</span>
                      <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
                      <span className="rank-val">{j.cartoes ?? 0}<span className="rank-lbl"> cart.</span></span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(aba === "Presença") && (
            <RankingCard titulo="Mais Jogos" icone="🏟" lista={porJogos} campo="jogos" label="jogos" />
          )}

        </div>
      </div>
    </Layout>
  );
}
