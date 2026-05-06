import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import CartaFifa from "../components/CartaFifa";
import { getJogadores } from "../services/api"; // ✅ import estático (igual ao Home.jsx)
import { getTipo, TIER_INFO, calcPontos } from "../utils/playerTier";
import "../style/Jogadores.css";

export default function Jogadores() {
  const [jogadores,     setJogadores]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState(null);
  const [busca,         setBusca]         = useState("");
  const [filtroPosicao, setFiltroPosicao] = useState("Todos");
  const [filtroOrdem,   setFiltroOrdem]   = useState("overall");

  useEffect(() => {
    // ✅ Renomeado de "fetch" para "carregarJogadores" — evita sobrescrever o fetch global
    const carregarJogadores = async () => {
      try {
        const lista = await getJogadores();
        setJogadores(lista ?? []);
      } catch (err) {
        console.error("Erro ao carregar jogadores:", err);
        setErro("Erro ao carregar jogadores. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    carregarJogadores();
  }, []);

  const posicoes = ["Todos", ...new Set(jogadores.map(j => j.posicao).filter(Boolean))];

  const filtrados = jogadores
    .filter(j => {
      const matchBusca = j.nome?.toLowerCase().includes(busca.toLowerCase());
      const matchPos   = filtroPosicao === "Todos" || j.posicao === filtroPosicao;
      return matchBusca && matchPos;
    })
    .sort((a, b) => {
      if (filtroOrdem === "overall") return (b.overall ?? 0) - (a.overall ?? 0);
      if (filtroOrdem === "gols")    return (b.gols ?? 0) - (a.gols ?? 0);
      if (filtroOrdem === "nome")    return (a.nome ?? "").localeCompare(b.nome ?? "");
      return 0;
    });

  return (
    <Layout>
      <div className="jogadores-page">
        <div className="jogadores-header">
          <h1 className="jogadores-titulo">
            Elenco <span className="titulo-destaque">Completo</span>
          </h1>
          <p className="jogadores-sub">{jogadores.length} jogadores cadastrados</p>
        </div>

        <div className="jogadores-filtros">
          <input
            className="filtro-busca"
            type="text"
            placeholder="Buscar jogador..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <div className="filtro-grupo">
            {posicoes.map(p => (
              <button
                key={p}
                className={`filtro-btn ${filtroPosicao === p ? "ativo" : ""}`}
                onClick={() => setFiltroPosicao(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <select
            className="filtro-select"
            value={filtroOrdem}
            onChange={e => setFiltroOrdem(e.target.value)}
          >
            <option value="overall">Overall ↓</option>
            <option value="gols">Gols ↓</option>
            <option value="nome">Nome A-Z</option>
          </select>
        </div>

        {loading && (
          <div className="jogadores-loading">
            <div className="loading-spinner" />
            <span>Carregando elenco...</span>
          </div>
        )}
        {erro && <div className="jogadores-erro">{erro}</div>}
        {!loading && !erro && filtrados.length === 0 && (
          <div className="jogadores-vazio">
            {jogadores.length === 0
              ? "Nenhum jogador cadastrado ainda."
              : "Nenhum jogador encontrado com esses filtros."}
          </div>
        )}

        <div className="jogadores-grid">
          {filtrados.map(j => {
            const tipo = getTipo(j, jogadores);
            const tier = TIER_INFO[tipo];
            const pontos = calcPontos(j);

            return (
              <div key={j.id_jogador ?? j.id} className="carta-wrap">
                <CartaFifa jogador={j} todos={jogadores} showBadge={false} />

                {/* ── ESTATÍSTICAS ABAIXO DA CARTA ── */}
                <div className="carta-rodape">
                  {/* Badge de tier */}
                  <span className={`rodape-tier tier-${tipo}`}>
                    {tier.badge}
                  </span>

                  {/* Stats em linha */}
                  <div className="rodape-stats">
                    <div className="stat-item" title="Gols">
                      <span className="stat-icon">⚽</span>
                      <span className="stat-val">{j.gols ?? 0}</span>
                      <span className="stat-lbl">Gols</span>
                    </div>
                    <div className="stat-sep" />
                    <div className="stat-item" title="Assistências">
                      <span className="stat-icon">🎯</span>
                      <span className="stat-val">{j.assistencias ?? 0}</span>
                      <span className="stat-lbl">Ass.</span>
                    </div>
                    <div className="stat-sep" />
                    <div className="stat-item" title="Jogos">
                      <span className="stat-icon">🏟</span>
                      <span className="stat-val">{j.jogos ?? 0}</span>
                      <span className="stat-lbl">Jogos</span>
                    </div>
                    <div className="stat-sep" />
                    <div className="stat-item" title="Pontos">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-val">{pontos}</span>
                      <span className="stat-lbl">Pts</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}