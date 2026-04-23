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
  { id: "meia", label: "MEI", x: 50, y: 48 },
  { id: "atq", label: "ATQ", x: 50, y: 28 },
];

const COR_TIME = ["#00ff87", "#ff4d6d"];
const NOME_TIME = ["Time Verde", "Time Vermelho"];

export default function Times() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  const [escA, setEscA] = useState({});
  const [escB, setEscB] = useState({});
  const [reservasA, setResA] = useState([]);
  const [reservasB, setResB] = useState([]);

  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/login");
      return;
    }

    carregar();
  }, []);

  async function carregar() {
    try {
      const [jogs, timesResp] = await Promise.all([
        getJogadores(),
        fetch(`${API_URL}/times-jogo`)
          .then((r) => r.json())
          .catch(() => []),
      ]);

      setJogadores(jogs);

      if (timesResp.length >= 2) {
        const montarEsc = (esc) => {
          const mapa = {};

          esc
            .filter((e) => !e.reserva)
            .forEach((e) => {
              if (e.jogador_id) mapa[e.posicao_campo] = Number(e.jogador_id);
            });

          return mapa;
        };

        setEscA(montarEsc(timesResp[0].escalacao || []));
        setEscB(montarEsc(timesResp[1].escalacao || []));

        const reservas = (esc) =>
          esc
            .filter((e) => e.reserva && e.jogador_id)
            .map((e) => Number(e.jogador_id));

        setResA(reservas(timesResp[0].escalacao || []));
        setResB(reservas(timesResp[1].escalacao || []));
      }
    } catch (erro) {
      console.error(erro);
    } finally {
      setLoading(false);
    }
  }

  function jogadorById(id) {
    return jogadores.find((j) => Number(j.id) === Number(id));
  }

  function escaladosIds() {
    return [
      ...Object.values(escA),
      ...Object.values(escB),
      ...reservasA,
      ...reservasB,
    ].map(Number);
  }

  function limparJogadorDosTimes(jogadorId) {
    const id = Number(jogadorId);

    setEscA((old) => {
      const novo = { ...old };
      Object.keys(novo).forEach((k) => {
        if (Number(novo[k]) === id) delete novo[k];
      });
      return novo;
    });

    setEscB((old) => {
      const novo = { ...old };
      Object.keys(novo).forEach((k) => {
        if (Number(novo[k]) === id) delete novo[k];
      });
      return novo;
    });

    setResA((old) => old.filter((x) => Number(x) !== id));
    setResB((old) => old.filter((x) => Number(x) !== id));
  }

  function iniciarDrag(e, jogadorId) {
    const id = Number(jogadorId);

    e.dataTransfer.setData("text/plain", id);
    setDragging(id);
  }

  function pegarIdDrop(e) {
    const data = e.dataTransfer.getData("text/plain");

    if (data) return Number(data);
    if (dragging) return Number(dragging);

    return null;
  }

  function dropSlot(e, time, slotId) {
    e.preventDefault();

    const jogadorId = pegarIdDrop(e);
    if (!jogadorId) return;

    limparJogadorDosTimes(jogadorId);

    if (time === "A") {
      setEscA((old) => ({
        ...old,
        [slotId]: jogadorId,
      }));
    } else {
      setEscB((old) => ({
        ...old,
        [slotId]: jogadorId,
      }));
    }

    setDragging(null);
  }

  function dropReserva(e, time) {
    e.preventDefault();

    const jogadorId = pegarIdDrop(e);
    if (!jogadorId) return;

    limparJogadorDosTimes(jogadorId);

    if (time === "A") {
      setResA((old) => [...old, jogadorId]);
    } else {
      setResB((old) => [...old, jogadorId]);
    }

    setDragging(null);
  }

  function removerDoSlot(time, slotId) {
    if (time === "A") {
      setEscA((old) => {
        const novo = { ...old };
        delete novo[slotId];
        return novo;
      });
    } else {
      setEscB((old) => {
        const novo = { ...old };
        delete novo[slotId];
        return novo;
      });
    }
  }

  function removerReserva(time, id) {
    if (time === "A") {
      setResA((old) => old.filter((x) => Number(x) !== Number(id)));
    } else {
      setResB((old) => old.filter((x) => Number(x) !== Number(id)));
    }
  }

  async function salvar() {
    setSalvando(true);
    setSucesso("");

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

      const montar = (esc, reservas) => [
        ...SLOTS_TIME.map((s) => ({
          posicao_campo: s.id,
          id_jogador: esc[s.id] || null,
          reserva: 0,
        })),
        ...reservas.map((id) => ({
          posicao_campo: "reserva",
          id_jogador: id,
          reserva: 1,
        })),
      ];

      await fetch(`${API_URL}/escalacao`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_time: timesResp[0].id,
          slots: montar(escA, reservasA),
        }),
      });

      await fetch(`${API_URL}/escalacao`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_time: timesResp[1].id,
          slots: montar(escB, reservasB),
        }),
      });

      setSucesso("Escalação salva!");
      setTimeout(() => setSucesso(""), 2500);
    } catch (erro) {
      console.error(erro);
    } finally {
      setSalvando(false);
    }
  }

  function Campo({ time, esc, cor }) {
    return (
      <div className="campo-svg-wrap">
        <div className="campo">
          <div className="campo-linha meio" />
          <div className="campo-circulo meio" />
          <div className="campo-area area-sup" />
          <div className="campo-area area-inf" />
          <div className="campo-goleira goleira-sup" />
          <div className="campo-goleira goleira-inf" />

          {SLOTS_TIME.map((slot) => {
            const jogId = esc[slot.id];
            const jog = jogId ? jogadorById(jogId) : null;

            return (
              <div
                key={slot.id}
                className="campo-slot"
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => dropSlot(e, time, slot.id)}
              >
                {jog ? (
                  <div
                    className="slot-jogador"
                    draggable
                    onDragStart={(e) => iniciarDrag(e, jog.id)}
                  >
                    <div
                      className="slot-foto"
                      style={{ borderColor: cor }}
                    >
                      {jog.fotoUrl ? (
                        <img src={jog.fotoUrl} alt={jog.nome} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>

                    <span className="slot-nome">
                      {jog.nome?.split(" ")[0]}
                    </span>

                    <button
                      className="slot-remove"
                      onClick={() => removerDoSlot(time, slot.id)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="slot-empty">
                    <span className="slot-pos-label">
                      {slot.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="loading-ball">⚽</div>
        </div>
      </Layout>
    );
  }

  const disponiveis = jogadores.filter(
    (j) => !escaladosIds().includes(Number(j.id))
  );

  return (
    <Layout>
      <div className="times-wrap">
        <h1 className="page-titulo">Times</h1>
        <p className="page-sub">
          Monte os times arrastando os jogadores
        </p>

        {sucesso && (
          <div className="times-sucesso">
            ✓ {sucesso}
          </div>
        )}

        <div className="times-layout">
          {/* TIME A */}
          <div className="time-col">
            <div
              className="time-header"
              style={{ borderColor: COR_TIME[0] }}
            >
              <span
                className="time-badge"
                style={{ background: COR_TIME[0] }}
              />
              <h2 style={{ color: COR_TIME[0] }}>
                Time Verde
              </h2>
            </div>

            <Campo
              time="A"
              esc={escA}
              cor={COR_TIME[0]}
            />

            <div
              className="reservas-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => dropReserva(e, "A")}
            >
              <p className="reservas-titulo">
                🪑 Reservas
              </p>

              <div className="reservas-lista">
                {reservasA.map((id) => {
                  const j = jogadorById(id);
                  if (!j) return null;

                  return (
                    <div
                      key={id}
                      className="reserva-item"
                      draggable
                      onDragStart={(e) =>
                        iniciarDrag(e, id)
                      }
                    >
                      <span>
                        {j.nome?.split(" ")[0]}
                      </span>

                      <button
                        onClick={() =>
                          removerReserva("A", id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DISPONIVEIS */}
          <div className="disponiveis-col">
            <h3 className="disp-titulo">
              Jogadores
            </h3>

            <div className="disp-lista">
              {disponiveis.map((j) => (
                <div
                  key={j.id}
                  className="disp-item"
                  draggable
                  onDragStart={(e) =>
                    iniciarDrag(e, j.id)
                  }
                >
                  <div className="disp-foto">
                    {j.fotoUrl ? (
                      <img
                        src={j.fotoUrl}
                        alt={j.nome}
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>

                  <div className="disp-info">
                    <span className="disp-nome">
                      {j.nome}
                    </span>
                    <span className="disp-pos">
                      {j.posicao}
                    </span>
                  </div>

                  <span className="disp-ovr">
                    {j.overall ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TIME B */}
          <div className="time-col">
            <div
              className="time-header"
              style={{ borderColor: COR_TIME[1] }}
            >
              <span
                className="time-badge"
                style={{ background: COR_TIME[1] }}
              />
              <h2 style={{ color: COR_TIME[1] }}>
                Time Vermelho
              </h2>
            </div>

            <Campo
              time="B"
              esc={escB}
              cor={COR_TIME[1]}
            />

            <div
              className="reservas-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => dropReserva(e, "B")}
            >
              <p className="reservas-titulo">
                🪑 Reservas
              </p>

              <div className="reservas-lista">
                {reservasB.map((id) => {
                  const j = jogadorById(id);
                  if (!j) return null;

                  return (
                    <div
                      key={id}
                      className="reserva-item"
                      draggable
                      onDragStart={(e) =>
                        iniciarDrag(e, id)
                      }
                    >
                      <span>
                        {j.nome?.split(" ")[0]}
                      </span>

                      <button
                        onClick={() =>
                          removerReserva("B", id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="times-actions">
          <button
            className="btn-salvar-times"
            onClick={salvar}
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : "💾 Salvar Escalação"}
          </button>
        </div>
      </div>
    </Layout>
  );
}