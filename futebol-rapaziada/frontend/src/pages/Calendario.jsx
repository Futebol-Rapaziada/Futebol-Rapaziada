import { useState, useEffect, useMemo } from "react";
import Layout from "../components/layout/Layout";
import "../style/Calendario.css";

// Gera jogos a cada 2 sextas a partir de 01/05/2025 às 23h
function gerarJogos(quantidade = 20) {
  const inicio = new Date(2025, 4, 1, 23, 0, 0); // 01/05/2025
  const hoje = new Date();
  const jogos = [];

  for (let i = 0; i < quantidade; i++) {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + i * 14);
    if (data > hoje) {
      jogos.push({ id: i + 1, rodada: i + 1, data });
    }
  }

  return jogos;
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function diasRestantes(data) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
}

function calcularTempo(alvo) {
  const diff = alvo - new Date();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function Countdown({ alvo }) {
  const [tempo, setTempo] = useState(() => calcularTempo(alvo));

  useEffect(() => {
    const id = setInterval(() => setTempo(calcularTempo(alvo)), 1000);
    return () => clearInterval(id);
  }, [alvo]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="countdown">
      {[
        { v: tempo.d, l: "dias" },
        { v: tempo.h, l: "horas" },
        { v: tempo.m, l: "min" },
        { v: tempo.s, l: "seg" },
      ].map(({ v, l }) => (
        <div key={l} className="cd-bloco">
          <span className="cd-num">{pad(v)}</span>
          <span className="cd-label">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function Calendario() {
  const jogos = useMemo(() => gerarJogos(20), []);
  const proximo = jogos[0] ?? null;

  return (
    <Layout>
      <div className="cal-page">

        {/* HEADER */}
        <div className="cal-header">
          <div>
            <h1 className="cal-titulo">
              Calendário <span className="cal-destaque">2025</span>
            </h1>
            <p className="cal-sub">Toda sexta alternada · 23h00 · Campo do Rapaziada</p>
          </div>
          {proximo && (
            <div className="cal-proximo-badge">
              <span className="cpb-label">próximo em</span>
              <span className="cpb-dias">{diasRestantes(proximo.data)}</span>
              <span className="cpb-label">dias</span>
            </div>
          )}
        </div>

        {/* CARD PRÓXIMO JOGO */}
        {proximo && (
          <div className="cal-destaque-card">
            <div className="cdc-glow" />
            <div className="cdc-left">
              <span className="cdc-rodada-label">Rodada {proximo.rodada}</span>
              <span className="cdc-tag">Próximo Jogo</span>
              <div className="cdc-data">{formatarData(proximo.data)}</div>
              <div className="cdc-meta">
                <span>🕚 23:00</span>
                <span>📍 Campo do Rapaziada</span>
              </div>
            </div>
            <div className="cdc-right">
              <p className="cdc-countdown-label">começa em</p>
              <Countdown alvo={proximo.data} />
            </div>
          </div>
        )}

        {/* LISTA */}
        <div className="cal-lista-wrap">
          <div className="cal-lista-header">
            <h2 className="cal-lista-titulo">Próximas Rodadas</h2>
            <span className="cal-lista-count">{jogos.length} jogos</span>
          </div>

          <div className="cal-lista">
            {jogos.map((jogo, idx) => {
              const dias = diasRestantes(jogo.data);
              const isProximo = idx === 0;
              return (
                <div
                  key={jogo.id}
                  className={`cal-item ${isProximo ? "cal-item-next" : ""}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="ci-num">
                    <span>{jogo.rodada}</span>
                  </div>

                  <div className="ci-info">
                    <span className="ci-data">{formatarData(jogo.data)}</span>
                    <span className="ci-hora">🕚 23:00 &nbsp;·&nbsp; 📍 Campo do Rapaziada</span>
                  </div>

                  <div className="ci-right">
                    {isProximo ? (
                      <span className="ci-badge">Próximo</span>
                    ) : (
                      <span className="ci-dias">em <b>{dias}</b> dias</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Layout>
  );
}