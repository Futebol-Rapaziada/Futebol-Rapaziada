import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Campeonato.css";

const ABAS = ["Ranking Geral", "Artilheiros", "Garçons", "Participação", "Defesa", "Desarmes"];

// Sistema de pontuação atualizado
const PONTOS = {
  gol:           3,
  assistencia:   2,
  defesa:        2,   // defesa de goleiro
  desarme:       2,   // desarme
  vitoria:       3,   // vitória
  empate:        1,   // empate
  derrota:       0,   // derrota (sem pontos)
  cartao_am:    -1,
  cartao_vm:    -3,
};

function calcPontos(j) {
  return (
    (j.gols              ?? 0) * PONTOS.gol        +
    (j.assistencias      ?? 0) * PONTOS.assistencia +
    (j.defesas           ?? 0) * PONTOS.defesa      +
    (j.desarmes          ?? 0) * PONTOS.desarme     +
    (j.vitorias          ?? 0) * PONTOS.vitoria     +
    (j.empates           ?? 0) * PONTOS.empate      +
    (j.cartoes           ?? 0) * PONTOS.cartao_am   +
    (j.cartoes_vermelhos ?? 0) * PONTOS.cartao_vm
  );
}

export default function Campeonato() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aba, setAba]             = useState("Ranking Geral");

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    getJogadores().then(setJogadores).catch(console.error).finally(() => setLoading(false));
  }, []);

  const isEu = j => j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();

  function medalha(i) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}º`;
  }

  // Listas ordenadas
  const porPontos    = [...jogadores].map(j => ({ ...j, _pts: calcPontos(j) })).sort((a, b) => b._pts - a._pts);
  const artilheiros  = [...jogadores].sort((a, b) => (b.gols ?? 0) - (a.gols ?? 0));
  const garcons      = [...jogadores].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  const participacao = [...jogadores].sort((a, b) => ((b.gols??0)+(b.assistencias??0)) - ((a.gols??0)+(a.assistencias??0)));
  const defesa       = [...jogadores].filter(j => (j.jogos ?? 0) > 0).sort((a, b) => (b.defesas ?? 0) - (a.defesas ?? 0));
  const desarmes     = [...jogadores].sort((a, b) => (b.desarmes ?? 0) - (a.desarmes ?? 0));

  function RankRow({ j, i, children }) {
    return (
      <div className={`rank-row ${isEu(j) ? "eu" : ""}`}>
        <span className="rr-pos">{medalha(i)}</span>
        <div className="rr-info">
          <span className="rr-nome">{j.nome?.split(" ")[0]}{isEu(j) && <span className="tag-eu">você</span>}</span>
          <span className="rr-pos-label">{j.posicao || "—"}</span>
        </div>
        {children}
      </div>
    );
  }

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div></div></Layout>;

  return (
    <Layout>
      <div className="camp-wrap">

        {/* Header */}
        <div className="camp-header">
          <div className="camp-badge">🏆</div>
          <div>
            <h1 className="page-titulo">Modo Carreira</h1>
            <p className="page-sub">Campeonato dos Jogadores — Temporada 2026</p>
          </div>
          <div className="camp-status">
            <span className="status-dot" />Em andamento
          </div>
        </div>

        {/* Tabela de pontuação */}
        <div className="pontos-legenda">
          <h3 className="pl-titulo">Sistema de Pontuação</h3>
          <div className="pl-grid">
            {[
              { l:"Gol",              v:"+3 pts", c:"pos" },
              { l:"Assistência",      v:"+2 pts", c:"pos" },
              { l:"Defesa (Goleiro)", v:"+2 pts", c:"pos" },
              { l:"Desarme",          v:"+2 pts", c:"pos" },
              { l:"Vitória",          v:"+3 pts", c:"pos" },
              { l:"Empate",           v:"+1 pt",  c:"neu" },
              { l:"Derrota",          v:"0 pts",  c:"neu" },
              { l:"Cartão Amarelo",   v:"−1 pt",  c:"neg" },
              { l:"Cartão Vermelho",  v:"−3 pts", c:"neg" },
            ].map(({l,v,c}) => (
              <div key={l} className={`pl-item pl-${c}`}>
                <span className="pl-lbl">{l}</span>
                <span className="pl-val">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abas */}
        <div className="abas">
          {ABAS.map(a => (
            <button key={a} className={`aba-btn ${aba===a?"ativa":""}`} onClick={() => setAba(a)}>{a}</button>
          ))}
        </div>

        {/* ── RANKING GERAL ── */}
        {aba === "Ranking Geral" && (
          <div className="camp-tabela-wrap">
            <table className="camp-tabela">
              <thead>
                <tr>
                  <th>#</th><th>Jogador</th><th>Pos.</th>
                  <th title="Jogos">JG</th>
                  <th title="Gols">G</th>
                  <th title="Assistências">A</th>
                  <th title="Vitórias">V</th>
                  <th title="Empates">E</th>
                  <th title="Derrotas">D</th>
                  <th title="Defesas de Goleiro">DEF</th>
                  <th title="Desarmes">DSM</th>
                  <th title="Cartões Amarelos">🟨</th>
                  <th title="Cartões Vermelhos">🟥</th>
                  <th title="Pontos" className="th-pts">PTS</th>
                </tr>
              </thead>
              <tbody>
                {porPontos.map((j, i) => (
                  <tr key={j.id??i} className={isEu(j)?"eu":""}>
                    <td className="col-pos">{medalha(i)}</td>
                    <td className="col-nome">
                      <span className="tab-av">👤</span>
                      {j.nome?.split(" ")[0]}
                      {isEu(j) && <span className="tag-eu">você</span>}
                    </td>
                    <td className="col-posicao">{j.posicao||"—"}</td>
                    <td>{j.jogos??0}</td>
                    <td className="col-dest">{j.gols??0}</td>
                    <td className="col-dest">{j.assistencias??0}</td>
                    <td className="col-vit">{j.vitorias??0}</td>
                    <td className="col-emp">{j.empates??0}</td>
                    <td className="col-der">{j.derrotas??0}</td>
                    <td>{j.defesas??0}</td>
                    <td className="col-dsm">{j.desarmes??0}</td>
                    <td>{j.cartoes??0}</td>
                    <td className="col-red">{j.cartoes_vermelhos??0}</td>
                    <td><span className="col-pts">{j._pts}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ARTILHEIROS ── */}
        {aba === "Artilheiros" && (
          <div className="rank-lista">
            {artilheiros.slice(0,10).map((j,i)=>(
              <RankRow key={j.id??i} j={j} i={i}>
                <span className="rr-stat">⚽ <strong>{j.gols??0}</strong> gols · <span className="rr-pts">+{(j.gols??0)*3} pts</span></span>
              </RankRow>
            ))}
          </div>
        )}

        {/* ── GARÇONS ── */}
        {aba === "Garçons" && (
          <div className="rank-lista">
            {garcons.slice(0,10).map((j,i)=>(
              <RankRow key={j.id??i} j={j} i={i}>
                <span className="rr-stat">🎯 <strong>{j.assistencias??0}</strong> ass. · <span className="rr-pts">+{(j.assistencias??0)*2} pts</span></span>
              </RankRow>
            ))}
          </div>
        )}

        {/* ── PARTICIPAÇÃO ── */}
        {aba === "Participação" && (
          <div className="rank-lista">
            {participacao.slice(0,10).map((j,i)=>(
              <RankRow key={j.id??i} j={j} i={i}>
                <span className="rr-stat">🔥 <strong>{(j.gols??0)+(j.assistencias??0)}</strong> G+A · <span className="rr-pts">+{(j.gols??0)*3+(j.assistencias??0)*2} pts</span></span>
              </RankRow>
            ))}
          </div>
        )}

        {/* ── DEFESA ── */}
        {aba === "Defesa" && (
          <div className="rank-lista">
            {defesa.length === 0
              ? <p className="camp-vazio">Nenhum jogador com jogos registrados.</p>
              : defesa.slice(0,10).map((j,i)=>(
                <RankRow key={j.id??i} j={j} i={i}>
                  <span className="rr-stat">🧤 <strong>{j.defesas??0}</strong> def. · <span className="rr-pts">+{(j.defesas??0)*2} pts</span></span>
                </RankRow>
              ))
            }
          </div>
        )}

        {/* ── DESARMES ── */}
        {aba === "Desarmes" && (
          <div className="rank-lista">
            {desarmes.length === 0
              ? <p className="camp-vazio">Nenhum desarme registrado ainda.</p>
              : desarmes.slice(0,10).map((j,i)=>(
                <RankRow key={j.id??i} j={j} i={i}>
                  <span className="rr-stat">🛡️ <strong>{j.desarmes??0}</strong> dsm. · <span className="rr-pts">+{(j.desarmes??0)*2} pts</span></span>
                </RankRow>
              ))
            }
          </div>
        )}

        <div className="camp-aviso">🚧 Jogos e rodadas serão adicionados em breve. Estatísticas atualizadas manualmente.</div>

      </div>
    </Layout>
  );
}