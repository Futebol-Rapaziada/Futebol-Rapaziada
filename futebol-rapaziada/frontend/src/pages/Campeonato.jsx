import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Campeonato.css";

const ABAS = ["Classificação", "Artilheiros", "Garçons", "Participação", "Defesa"];

export default function Campeonato() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aba, setAba]             = useState("Classificação");

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    getJogadores()
      .then(setJogadores)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function isEu(j) {
    return j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();
  }

  function medalha(i) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}º`;
  }

  // Classificação: ordenada por gols + assistências (participação geral)
  const classificacao = [...jogadores].sort((a, b) =>
    ((b.gols ?? 0) + (b.assistencias ?? 0)) - ((a.gols ?? 0) + (a.assistencias ?? 0))
  );

  const artilheiros = [...jogadores].sort((a, b) => (b.gols ?? 0) - (a.gols ?? 0));
  const garcons     = [...jogadores].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  const participacao = classificacao;
  const defesa      = [...jogadores]
    .filter(j => (j.jogos ?? 0) > 0)
    .sort((a, b) => (a.cartoes ?? 0) - (b.cartoes ?? 0));

  if (loading) return (
    <Layout>
      <div className="loading-screen"><div className="loading-ball">⚽</div><p>Carregando...</p></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="camp-wrap">

        {/* Header */}
        <div className="camp-header">
          <div className="camp-badge">🏆</div>
          <div>
            <h1 className="camp-titulo">Modo Carreira</h1>
            <p className="camp-sub">Campeonato dos Jogadores — Temporada 2026</p>
          </div>
          <div className="camp-status">
            <span className="status-dot" />
            Em andamento
          </div>
        </div>

        {/* Abas */}
        <div className="abas">
          {ABAS.map((a) => (
            <button key={a} className={`aba-btn ${aba === a ? "ativa" : ""}`} onClick={() => setAba(a)}>
              {a}
            </button>
          ))}
        </div>

        {/* ── CLASSIFICAÇÃO ── */}
        {aba === "Classificação" && (
          <div className="camp-tabela-wrap">
            <table className="camp-tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th title="Jogos">JG</th>
                  <th title="Gols">G</th>
                  <th title="Assistências">A</th>
                  <th title="Participações">G+A</th>
                  <th title="Cartões">🟨</th>
                  <th title="Overall">OVR</th>
                </tr>
              </thead>
              <tbody>
                {classificacao.map((j, i) => (
                  <tr key={j.id ?? i} className={isEu(j) ? "eu" : ""}>
                    <td className="col-pos">{medalha(i)}</td>
                    <td className="col-nome">
                      <span className="tabela-avatar">👤</span>
                      {j.nome?.split(" ")[0]}
                      {isEu(j) && <span className="tag-eu">você</span>}
                    </td>
                    <td>{j.jogos ?? 0}</td>
                    <td className="col-destaque">{j.gols ?? 0}</td>
                    <td className="col-destaque">{j.assistencias ?? 0}</td>
                    <td className="col-participacao">{(j.gols ?? 0) + (j.assistencias ?? 0)}</td>
                    <td>{j.cartoes ?? 0}</td>
                    <td><span className="col-overall">{j.overall ?? 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ARTILHEIROS ── */}
        {aba === "Artilheiros" && (
          <div className="camp-ranking">
            {artilheiros.slice(0, 10).map((j, i) => (
              <div key={j.id ?? i} className={`camp-rank-item ${isEu(j) ? "eu" : ""}`}>
                <span className="rank-pos">{medalha(i)}</span>
                <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
                <span className="rank-stat">⚽ <strong>{j.gols ?? 0}</strong> gols</span>
              </div>
            ))}
          </div>
        )}

        {/* ── GARÇONS ── */}
        {aba === "Garçons" && (
          <div className="camp-ranking">
            {garcons.slice(0, 10).map((j, i) => (
              <div key={j.id ?? i} className={`camp-rank-item ${isEu(j) ? "eu" : ""}`}>
                <span className="rank-pos">{medalha(i)}</span>
                <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
                <span className="rank-stat">🎯 <strong>{j.assistencias ?? 0}</strong> assistências</span>
              </div>
            ))}
          </div>
        )}

        {/* ── PARTICIPAÇÃO ── */}
        {aba === "Participação" && (
          <div className="camp-ranking">
            {participacao.slice(0, 10).map((j, i) => (
              <div key={j.id ?? i} className={`camp-rank-item ${isEu(j) ? "eu" : ""}`}>
                <span className="rank-pos">{medalha(i)}</span>
                <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
                <span className="rank-stat">
                  🔥 <strong>{(j.gols ?? 0) + (j.assistencias ?? 0)}</strong> G+A
                  <span className="rank-detail"> ({j.gols ?? 0}G {j.assistencias ?? 0}A)</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── DEFESA ── */}
        {aba === "Defesa" && (
          <div className="camp-ranking">
            {defesa.length === 0
              ? <p className="camp-vazio">Nenhum jogador com jogos registrados ainda.</p>
              : defesa.slice(0, 10).map((j, i) => (
                <div key={j.id ?? i} className={`camp-rank-item ${isEu(j) ? "eu" : ""}`}>
                  <span className="rank-pos">{medalha(i)}</span>
                  <span className="rank-nome">{j.nome?.split(" ")[0]} {isEu(j) ? "(você)" : ""}</span>
                  <span className="rank-stat">🟨 <strong>{j.cartoes ?? 0}</strong> cartões</span>
                </div>
              ))
            }
          </div>
        )}

        {/* Aviso de construção */}
        <div className="camp-aviso">
          🚧 Jogos e rodadas serão adicionados em breve. Por enquanto, as estatísticas são atualizadas manualmente pelo perfil.
        </div>

      </div>
    </Layout>
  );
}
