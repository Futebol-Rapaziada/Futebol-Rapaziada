import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/Times.css";

export default function Times() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [timeA, setTimeA] = useState({
    gol: "",
    zag1: "",
    zag2: "",
    ala1: "",
    ala2: "",
    meia: "",
    atq: ""
  });

  const [timeB, setTimeB] = useState({
    gol: "",
    zag1: "",
    zag2: "",
    ala1: "",
    ala2: "",
    meia: "",
    atq: ""
  });

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await getJogadores();
        setJogadores(dados);
      } catch (erro) {
        console.error(erro);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  function alterarJogador(time, posicao, valor) {
    if (time === "A") {
      setTimeA((old) => ({
        ...old,
        [posicao]: valor
      }));
    } else {
      setTimeB((old) => ({
        ...old,
        [posicao]: valor
      }));
    }
  }

  function nomeJogador(id) {
    const jogador = jogadores.find((j) => String(j.id) === String(id));
    return jogador ? jogador.nome : "";
  }

  function Campo({ titulo, cor, dados, time }) {
    return (
      <div className="time-box">
        <h2 style={{ color: cor }}>{titulo}</h2>

        <div className="campo">

          <div className="slot gol">
            <span>{nomeJogador(dados.gol) || "GOL"}</span>
            <select
              value={dados.gol}
              onChange={(e) => alterarJogador(time, "gol", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="slot zag1">
            <span>{nomeJogador(dados.zag1) || "ZAG"}</span>
            <select
              value={dados.zag1}
              onChange={(e) => alterarJogador(time, "zag1", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="slot zag2">
            <span>{nomeJogador(dados.zag2) || "ZAG"}</span>
            <select
              value={dados.zag2}
              onChange={(e) => alterarJogador(time, "zag2", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="slot ala1">
            <span>{nomeJogador(dados.ala1) || "ALA"}</span>
            <select
              value={dados.ala1}
              onChange={(e) => alterarJogador(time, "ala1", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="slot ala2">
            <span>{nomeJogador(dados.ala2) || "ALA"}</span>
            <select
              value={dados.ala2}
              onChange={(e) => alterarJogador(time, "ala2", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="slot meia">
            <span>{nomeJogador(dados.meia) || "MEIA"}</span>
            <select
              value={dados.meia}
              onChange={(e) => alterarJogador(time, "meia", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="slot atq">
            <span>{nomeJogador(dados.atq) || "ATQ"}</span>
            <select
              value={dados.atq}
              onChange={(e) => alterarJogador(time, "atq", e.target.value)}
            >
              <option value="">Escolher</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Layout>
        <h1>Carregando...</h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="times-page">

        <h1 className="titulo">Montagem dos Times</h1>

        <div className="times-grid">
          <Campo titulo="Time Verde" cor="#00ff88" dados={timeA} time="A" />
          <Campo titulo="Time Vermelho" cor="#ff3b5c" dados={timeB} time="B" />
        </div>

      </div>
    </Layout>
  );
}