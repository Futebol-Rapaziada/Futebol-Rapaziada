import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Times.css";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "https://futebol-rapaziada-production.up.railway.app";

const SLOTS_TIME = [
  { id: "gol", label: "GOL", x: 50, y: 88 },
  { id: "zag1", label: "ZAG", x: 30, y: 72 },
  { id: "zag2", label: "ZAG", x: 70, y: 72 },
  { id: "lat1", label: "LAT", x: 15, y: 55 },
  { id: "lat2", label: "LAT", x: 85, y: 55 },
  { id: "meia", label: "MEI", x: 50, y: 45 },
  { id: "atq", label: "ATQ", x: 50, y: 25 },
];

const COR_TIME = ["#00ff87", "#ff4d6d"];
const NOME_TIME = ["Time Verde", "Time Vermelho"];

export default function Times() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [escA, setEscA] = useState({});
  const [escB, setEscB] = useState({});

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/login");
      return;
    }
    carregar();
  }, []);

  async function carregar() {
    try {
      const jogs = await getJogadores();
      setJogadores(jogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function jogadorById(id) {
    return jogadores.find((j) => j.id === Number(id));
  }

  function mudarJogador(time, posicao, valor) {
    const id = valor ? Number(valor) : null;

    if (time === "A") {
      setEscA((old) => ({ ...old, [posicao]: id }));
    } else {
      setEscB((old) => ({ ...old, [posicao]: id }));
    }
  }

  async function salvar() {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let timesResp = await fetch(`${API_URL}/times-jogo`)
        .then((r) => r.json())
        .catch(() => []);

      for (let i = timesResp.length; i < 2; i++) {
        const res = await fetch(`${API_URL}/times-jogo`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            nome: NOME_TIME[i],
            cor: COR_TIME[i],
          }),
        });

        const novo = await res.json();
        timesResp.push({ id: novo.id });
      }

      const montar = (esc) =>
        SLOTS_TIME.map((s) => ({
          posicao_campo: s.id,
          id_jogador: esc[s.id] || null,
          reserva: 0,
        }));

      await fetch(`${API_URL}/escalacao`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_time: timesResp[0].id,
          slots: montar(escA),
        }),
      });

      await fetch(`${API_URL}/escalacao`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_time: timesResp[1].id,
          slots: montar(escB),
        }),
      });

      alert("Times salvos!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    }
  }

  function Campo({ time, esc, cor }) {
    return (
      <div className="campo-svg-wrap">
        <div className="campo">
          {SLOTS_TIME.map((slot) => {
            const jog = jogadorById(esc[slot.id]);

            return (
              <div
                key={slot.id}
                className="campo-slot"
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                }}
              >
                {jog ? (
                  <div className="slot-jogador">
                    <div
                      className="slot-foto"
                      style={{ borderColor: cor }}
                    >
                      {jog.fotoUrl ? (
                        <img src={jog.fotoUrl} alt={jog.nome} />
                      ) : (
                        "👤"
                      )}
                    </div>

                    <span className="slot-nome">
                      {jog.nome.split(" ")[0]}
                    </span>
                  </div>
                ) : (
                  <div className="slot-empty">{slot.label}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) return <Layout>Carregando...</Layout>;

  return (
    <Layout>
      <div className="times-wrap">
        <h1 className="page-titulo">TIMES</h1>

        <div className="times-layout">
          {/* TIME A */}
          <div>
            <h2 style={{ color: COR_TIME[0] }}>Time Verde</h2>

            <Campo time="A" esc={escA} cor={COR_TIME[0]} />

            {SLOTS_TIME.map((slot) => (
              <select
                key={slot.id}
                value={escA[slot.id] || ""}
                onChange={(e) =>
                  mudarJogador("A", slot.id, e.target.value)
                }
                className="select-time"
              >
                <option value="">
                  {slot.label} - Escolher jogador
                </option>

                {jogadores.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nome}
                  </option>
                ))}
              </select>
            ))}
          </div>

          {/* TIME B */}
          <div>
            <h2 style={{ color: COR_TIME[1] }}>Time Vermelho</h2>

            <Campo time="B" esc={escB} cor={COR_TIME[1]} />

            {SLOTS_TIME.map((slot) => (
              <select
                key={slot.id}
                value={escB[slot.id] || ""}
                onChange={(e) =>
                  mudarJogador("B", slot.id, e.target.value)
                }
                className="select-time"
              >
                <option value="">
                  {slot.label} - Escolher jogador
                </option>

                {jogadores.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nome}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        <div className="times-actions">
          <button
            className="btn-salvar-times"
            onClick={salvar}
          >
            SALVAR TIMES
          </button>
        </div>
      </div>
    </Layout>
  );
}