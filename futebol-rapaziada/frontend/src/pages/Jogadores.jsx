import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getTipo, getAtribs, atribColor, TIER_INFO } from "../utils/playerTier";
import "../style/Jogadores.css";

function CartaJogador({ jogador, todos }) {
  const tipo   = getTipo(jogador, todos);
  const atribs = getAtribs(jogador);
  const tier   = TIER_INFO[tipo];

  return (
    <div className="carta-wrap">
      <div className={`carta carta-${tipo}`}>
        {tipo === "legend"   && <div className="carta-bg-legend"><div className="orb o1"/><div className="orb o2"/><div className="orb o3"/></div>}
        {tipo === "champion" && <div className="carta-bg-champion"><div className="orb c1"/><div className="orb c2"/></div>}
        {tipo === "ouro"     && <div className="carta-bg-ouro"><div className="s1"/><div className="s2"/></div>}
        {tipo === "prata"    && <div className="carta-bg-prata"><div className="p1"/><div className="p2"/></div>}
        {tipo === "bronze"   && <div className="carta-bg-bronze"><div className="b1"/><div className="b2"/></div>}

        {tipo === "legend"   && <div className="carta-crown carta-star z1">✦</div>}
        {tipo === "champion" && <div className="carta-crown carta-king z1">♛</div>}

        <div className="carta-top z1">
          <div className="carta-ovr">{jogador.overall || "0"}</div>
          <div className="carta-pos">{jogador.posicao || "—"}</div>
          <div className="carta-flag">🇧🇷</div>
        </div>

        <div className="carta-foto z1">
          {jogador.fotoUrl ? <img src={jogador.fotoUrl} alt={jogador.nome}/> : <span>👤</span>}
        </div>

        <div className="carta-nome z1">{jogador.nome?.split(" ")[0]?.toUpperCase()}</div>
        <div className="carta-div z1"/>

        <div className="carta-atribs z1">
          <div className="atrib-col">
            {atribs.slice(0,3).map(a => (
              <div key={a.k} className="atrib">
                <span className="av" style={{color: atribColor(a.v)}}>{a.v}</span>
                <span className="al">{a.l}</span>
              </div>
            ))}
          </div>
          <div className="atrib-sep"/>
          <div className="atrib-col">
            {atribs.slice(3).map(a => (
              <div key={a.k} className="atrib">
                <span className="av" style={{color: atribColor(a.v)}}>{a.v}</span>
                <span className="al">{a.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="carta-rodape">
        <div className="rodape-topo">
          <span className="rodape-nome">{jogador.nome}</span>
          <span className={`rodape-tier tier-${tipo}`}>{tier.badge}</span>
        </div>
        <div className="rodape-stats">
          <span title="Gols">⚽ {jogador.gols ?? 0}</span>
          <span title="Assistências">🎯 {jogador.assistencias ?? 0}</span>
          <span title="Jogos">🏟 {jogador.jogos ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

export default function Jogadores() {
  const [jogadores,     setJogadores]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState(null);
  const [busca,         setBusca]         = useState("");
  const [filtroPosicao, setFiltroPosicao] = useState("Todos");
  const [filtroOrdem,   setFiltroOrdem]   = useState("overall");

  useEffect(() => {
    const fetchJogadores = async () => {
      try {
        const { getJogadores } = await import("../services/api");
        const data = await getJogadores();
        setJogadores(data);
      } catch {
        setErro("Erro ao carregar jogadores.");
      } finally {
        setLoading(false);
      }
    };
    fetchJogadores();
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
          <h1 className="jogadores-titulo">Elenco <span className="titulo-destaque">Completo</span></h1>
          <p className="jogadores-sub">{jogadores.length} jogadores cadastrados</p>
        </div>

        <div className="jogadores-filtros">
          <input
            className="filtro-busca" type="text" placeholder="Buscar jogador..."
            value={busca} onChange={e => setBusca(e.target.value)}
          />
          <div className="filtro-grupo">
            {posicoes.map(p => (
              <button key={p} className={`filtro-btn ${filtroPosicao === p ? "ativo" : ""}`}
                onClick={() => setFiltroPosicao(p)}>{p}</button>
            ))}
          </div>
          <select className="filtro-select" value={filtroOrdem} onChange={e => setFiltroOrdem(e.target.value)}>
            <option value="overall">Overall ↓</option>
            <option value="gols">Gols ↓</option>
            <option value="nome">Nome A-Z</option>
          </select>
        </div>

        {loading && <div className="jogadores-loading"><div className="loading-spinner"/><span>Carregando elenco...</span></div>}
        {erro    && <div className="jogadores-erro">{erro}</div>}
        {!loading && !erro && filtrados.length === 0 && <div className="jogadores-vazio">Nenhum jogador encontrado.</div>}

        <div className="jogadores-grid">
          {filtrados.map(j => (
            <CartaJogador key={j.id_jogador ?? j.id} jogador={j} todos={jogadores} />
          ))}
        </div>
      </div>
    </Layout>
  );
}