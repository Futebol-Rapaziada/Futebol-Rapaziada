import { useEffect, useState } from "react";
import "./Times.css";

const POSICOES = [
  { id: "gol", nome: "Goleiro", x: "50%", y: "88%" },
  { id: "zag1", nome: "Zagueiro", x: "32%", y: "68%" },
  { id: "zag2", nome: "Zagueiro", x: "68%", y: "68%" },
  { id: "ala1", nome: "Ala", x: "18%", y: "48%" },
  { id: "ala2", nome: "Ala", x: "82%", y: "48%" },
  { id: "meia", nome: "Meia", x: "50%", y: "48%" },
  { id: "ata", nome: "Atacante", x: "50%", y: "22%" },
];

export default function Times() {
  const [jogadores, setJogadores] = useState([]);
  const [timeVerde, setTimeVerde] = useState({});
  const [timeVermelho, setTimeVermelho] = useState({});

  useEffect(() => {
    carregarJogadores();
  }, []);

  async function carregarJogadores() {
    try {
      const res = await fetch("http://localhost:5000/jogadores");
      const data = await res.json();
      setJogadores(data);
    } catch (erro) {
      console.log("Erro ao buscar jogadores");
    }
  }

  function alterarJogador(time, posicao, id) {
    if (time === "verde") {
      setTimeVerde({ ...timeVerde, [posicao]: id });
    } else {
      setTimeVermelho({ ...timeVermelho, [posicao]: id });
    }
  }

  function buscarJogador(id) {
    return jogadores.find((j) => String(j.id) === String(id));
  }

  function renderCampo(time, dados, titulo, cor) {
    return (
      <div className="box-time">
        <h2 style={{ color }}>{titulo}</h2>

        <div className="campo">
          {POSICOES.map((p) => {
            const jogador = buscarJogador(dados[p.id]);

            return (
              <div
                key={p.id}
                className="slot"
                style={{ left: p.x, top: p.y }}
              >
                {jogador ? (
                  <div className="card-player">
                    <img src={jogador.fotoUrl} alt="" />
                    <span>{jogador.nome}</span>
                  </div>
                ) : (
                  <div className="slot-vazio">{p.nome}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lista-select">
          {POSICOES.map((p) => (
            <select
              key={p.id}
              value={dados[p.id] || ""}
              onChange={(e) =>
                alterarJogador(time, p.id, e.target.value)
              }
            >
              <option value="">{p.nome}</option>

              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-times">
      <h1>Montagem de Times</h1>

      <div className="grid-times">
        {renderCampo("verde", timeVerde, "Time Verde", "#00ff87")}
        {renderCampo("vermelho", timeVermelho, "Time Vermelho", "#ff4d4d")}
      </div>
    </div>
  );
}