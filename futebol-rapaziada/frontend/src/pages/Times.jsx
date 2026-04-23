import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/Times.css";

const POSICOES = [
  { id: "gol", nome: "Goleiro", x: 50, y: 88 },
  { id: "zag1", nome: "Zagueiro", x: 30, y: 68 },
  { id: "zag2", nome: "Zagueiro", x: 70, y: 68 },
  { id: "ala1", nome: "Ala", x: 18, y: 48 },
  { id: "ala2", nome: "Ala", x: 82, y: 48 },
  { id: "meia", nome: "Meia", x: 50, y: 48 },
  { id: "ata", nome: "Atacante", x: 50, y: 22 },
];

export default function Times() {
  const [jogadores, setJogadores] = useState([]);

  const [timeA, setTimeA] = useState({});
  const [timeB, setTimeB] = useState({});

  useEffect(() => {
    carregarJogadores();
  }, []);

  async function carregarJogadores() {
    const dados = await getJogadores();
    setJogadores(dados);
  }

  function alterarJogador(time, posicao, idJogador) {
    if (time === "A") {
      setTimeA({ ...timeA, [posicao]: idJogador });
    } else {
      setTimeB({ ...timeB, [posicao]: idJogador });
    }
  }

  function pegarJogador(id) {
    return jogadores.find((j) => String(j.id) === String(id));
  }

  function Campo({ time, dados, cor }) {
    return (
      <div className="campo">
        {POSICOES.map((p) => {
          const jogador = pegarJogador(dados[p.id]);

          return (
            <div
              key={p.id}
              className="posicao"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {jogador ? (
                <div className="player-card">
                  <img src={jogador.fotoUrl} alt="" />
                  <span>{jogador.nome}</span>
                </div>
              ) : (
                <div className="vazio">{p.nome}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function Selects({ time, dados }) {
    return (
      <div className="lista-selects">
        {POSICOES.map((p) => (
          <div key={p.id} className="linha-select">
            <label>{p.nome}</label>

            <select
              value={dados[p.id] || ""}
              onChange={(e) =>
                alterarJogador(time, p.id, e.target.value)
              }
            >
              <option value="">Selecionar</option>

              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="times-wrap">

        <h1 className="titulo">Montar Times</h1>

        <div className="times-grid">

          {/* TIME A */}
          <div className="bloco-time">
            <h2 className="verde">Time Verde</h2>
            <Campo time="A" dados={timeA} cor="#00ff87" />
            <Selects time="A" dados={timeA} />
          </div>

          {/* TIME B */}
          <div className="bloco-time">
            <h2 className="vermelho">Time Vermelho</h2>
            <Campo time="B" dados={timeB} cor="#ff4d4d" />
            <Selects time="B" dados={timeB} />
          </div>

        </div>
      </div>
    </Layout>
  );
}