import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../style/Jogos.css";

export default function Jogos() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!usuarioLogado) navigate("/login");
  }, []);

  useEffect(() => {
    fetch("/jogos")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar jogos");
        return res.json();
      })
      .then((data) => {
        setJogos(data);
        setLoading(false);
      })
      .catch((err) => {
        setErro(err.message);
        setLoading(false);
      });
  }, []);

  const formatarData = (dataStr) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="jogos-wrap">
        <h1 className="page-titulo">Jogos</h1>
        <p className="page-sub">Histórico e próximos jogos da temporada 2026</p>

        {loading && (
          <div className="jogos-empty">
            <span className="je-icone">⏳</span>
            <h2>Carregando jogos...</h2>
          </div>
        )}

        {erro && (
          <div className="jogos-empty">
            <span className="je-icone">⚠️</span>
            <h2>Erro ao carregar jogos</h2>
            <p>{erro}</p>
          </div>
        )}

        {!loading && !erro && jogos.length === 0 && (
          <div className="jogos-empty">
            <span className="je-icone">⚽</span>
            <h2>Nenhum jogo cadastrado ainda</h2>
            <p>Os jogos serão adicionados conforme a temporada avançar.</p>
            <div className="camp-aviso" style={{ marginTop: 20 }}>
              🚧 Em breve: registro de jogos com placar, artilheiros e
              assistências automáticas.
            </div>
          </div>
        )}

        {!loading && !erro && jogos.length > 0 && (
          <div className="jogos-lista">
            {jogos.map((j) => {
              const timeAVenceu = j.vencedor === "Time A";
              const timeBVenceu = j.vencedor === "Time B";

              return (
                <div key={j.id_jogo} className="jogo-card">
                  <div className="jogo-card__data">
                    ⚽ {formatarData(j.data_jogo)}
                  </div>

                  <div className="jogo-card__placar">
                    <div
                      className={`jogo-card__time ${
                        timeAVenceu ? "jogo-card__time--vencedor" : ""
                      }`}
                    >
                      <span className="jogo-card__time-nome">Time A</span>
                      <span className="jogo-card__gols">{j.placar_time_a}</span>
                    </div>

                    <span className="jogo-card__vs">×</span>

                    <div
                      className={`jogo-card__time ${
                        timeBVenceu ? "jogo-card__time--vencedor" : ""
                      }`}
                    >
                      <span className="jogo-card__gols">{j.placar_time_b}</span>
                      <span className="jogo-card__time-nome">Time B</span>
                    </div>
                  </div>

                  <div className="jogo-card__rodape">
                    {j.vencedor ? (
                      <span className="jogo-card__badge jogo-card__badge--vitoria">
                        🏆 Vencedor: {j.vencedor}
                      </span>
                    ) : (
                      <span className="jogo-card__badge jogo-card__badge--empate">
                        🤝 Empate
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}