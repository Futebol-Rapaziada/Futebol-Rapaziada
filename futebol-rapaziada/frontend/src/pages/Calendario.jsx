import { useState, useEffect, useMemo } from "react";
import Layout from "../components/layout/Layout";
import "../style/Calendario.css";

// Encontra a próxima sexta-feira a cada 2 semanas a partir de 01/05/2025
function gerarProximosJogos(quantidade = 12) {
  // Data de referência: primeira sexta >= 01/05/2025
  const ref = new Date(2025, 4, 1, 23, 0, 0); // 01 Mai 2025
  // Garante que ref seja sexta-feira (dia 5)
  while (ref.getDay() !== 5) ref.setDate(ref.getDate() + 1);

  const hoje = new Date();
  const jogos = [];

  for (let i = 0; i < 200; i++) {
    const data = new Date(ref);
    data.setDate(ref.getDate() + i * 14);
    data.setHours(23, 0, 0, 0);

    if (data >= hoje) {
      jogos.push({ rodada: i + 1, data: new Date(data) });
      if (jogos.length >= quantidade) break;
    }
  }

  return jogos;
}

// Gera dias do mês para o mini-calendário
function gerarDiasMes(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1).getDay(); // 0=Dom
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  return { primeiroDia, totalDias };
}

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function pad(n) { return String(n).padStart(2, "0"); }

function calcTempo(alvo) {
  const diff = alvo - new Date();
  if (diff <= 0) return { d:0, h:0, m:0, s:0 };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function Countdown({ alvo }) {
  const [t, setT] = useState(() => calcTempo(alvo));
  useEffect(() => {
    const id = setInterval(() => setT(calcTempo(alvo)), 1000);
    return () => clearInterval(id);
  }, [alvo]);

  return (
    <div className="countdown">
      {[{v:t.d,l:"dias"},{v:t.h,l:"hrs"},{v:t.m,l:"min"},{v:t.s,l:"seg"}].map(({v,l}) => (
        <div key={l} className="cd-bloco">
          <span className="cd-num">{pad(v)}</span>
          <span className="cd-lbl">{l}</span>
        </div>
      ))}
    </div>
  );
}

function MiniCalendario({ ano, mes, datasJogo }) {
  const { primeiroDia, totalDias } = gerarDiasMes(ano, mes);
  const hoje = new Date();
  const cells = [];

  // células vazias antes do dia 1
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= totalDias; d++) cells.push(d);

  return (
    <div className="mini-cal">
      <div className="mc-cabecalho">
        {DIAS_SEMANA.map(d => <span key={d} className="mc-dia-semana">{d}</span>)}
      </div>
      <div className="mc-grid">
        {cells.map((dia, idx) => {
          if (!dia) return <span key={`e${idx}`} className="mc-celula mc-vazia" />;
          const data = new Date(ano, mes, dia);
          const isJogo = datasJogo.some(d =>
            d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === dia
          );
          const isHoje = hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === dia;
          return (
            <span
              key={dia}
              className={`mc-celula ${isJogo ? "mc-jogo" : ""} ${isHoje ? "mc-hoje" : ""}`}
              title={isJogo ? "⚽ Futebol 23h00" : ""}
            >
              {dia}
              {isJogo && <span className="mc-bolinha" />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendario() {
  const jogos = useMemo(() => gerarProximosJogos(12), []);
  const proximo = jogos[0];

  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

  const datasJogo = jogos.map(j => j.data);

  function mesAnterior() {
    if (mesAtual === 0) { setMesAtual(11); setAnoAtual(a => a - 1); }
    else setMesAtual(m => m - 1);
  }

  function proximoMes() {
    if (mesAtual === 11) { setMesAtual(0); setAnoAtual(a => a + 1); }
    else setMesAtual(m => m + 1);
  }

  return (
    <Layout>
      <div className="cal-page">

        {/* HEADER */}
        <div className="cal-header">
          <div>
            <h1 className="cal-titulo">Calendário <span className="cal-verde">2025</span></h1>
            <p className="cal-sub">⚽ Futebol toda sexta alternada · 23h00 · Campo do Rapaziada</p>
          </div>
        </div>

        {/* PRÓXIMO JOGO */}
        {proximo && (
          <div className="cal-proximo">
            <div className="cp-glow" />
            <div className="cp-esq">
              <span className="cp-tag">Próximo Jogo</span>
              <div className="cp-data">
                {proximo.data.toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric"
                })}
              </div>
              <div className="cp-meta">
                <span>🕚 23:00</span>
                <span>📍 Campo do Rapaziada</span>
                <span>⚽ Rodada {proximo.rodada}</span>
              </div>
            </div>
            <div className="cp-dir">
              <p className="cp-ct-label">começa em</p>
              <Countdown alvo={proximo.data} />
            </div>
          </div>
        )}

        {/* LAYOUT: CALENDÁRIO VISUAL + LISTA */}
        <div className="cal-corpo">

          {/* CALENDÁRIO VISUAL */}
          <div className="cal-visual">
            <div className="cv-nav">
              <button className="cv-btn" onClick={mesAnterior}>‹</button>
              <span className="cv-mes-titulo">{MESES[mesAtual]} {anoAtual}</span>
              <button className="cv-btn" onClick={proximoMes}>›</button>
            </div>
            <MiniCalendario ano={anoAtual} mes={mesAtual} datasJogo={datasJogo} />
            <div className="cv-legenda">
              <span className="cv-leg-item"><span className="cv-leg-bolinha" />Dia de futebol</span>
              <span className="cv-leg-item"><span className="cv-leg-hoje" />Hoje</span>
            </div>
          </div>

          {/* LISTA DE JOGOS */}
          <div className="cal-lista-wrap">
            <div className="cl-header">
              <h2 className="cl-titulo">Próximas Rodadas</h2>
              <span className="cl-count">{jogos.length} jogos</span>
            </div>
            <div className="cal-lista">
              {jogos.map((jogo, idx) => {
                const diff = jogo.data - new Date();
                const dias = Math.ceil(diff / 86400000);
                const isNext = idx === 0;
                return (
                  <div
                    key={jogo.rodada}
                    className={`cl-item ${isNext ? "cl-item-next" : ""}`}
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className={`cl-num ${isNext ? "cl-num-next" : ""}`}>
                      {jogo.rodada}
                    </div>
                    <div className="cl-info">
                      <span className="cl-data">
                        {jogo.data.toLocaleDateString("pt-BR", {
                          weekday: "short", day: "2-digit", month: "short"
                        })}
                      </span>
                      <span className="cl-hora">🕚 23:00</span>
                    </div>
                    <div className="cl-dir">
                      {isNext
                        ? <span className="cl-badge">Próximo ⚡</span>
                        : <span className="cl-dias">em <b>{dias}</b>d</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}