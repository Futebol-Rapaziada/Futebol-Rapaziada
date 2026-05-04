import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import CartaFifa from "../components/CartaFifa";
import "../style/Jogadores.css";

export default function Jogadores() {
  const [jogadores,     setJogadores]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState(null);
  const [busca,         setBusca]         = useState("");
  const [filtroPosicao, setFiltroPosicao] = useState("Todos");
  const [filtroOrdem,   setFiltroOrdem]   = useState("overall");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { getJogadores } = await import("../services/api");
        setJogadores(await getJogadores());
      } catch { setErro("Erro ao carregar jogadores."); }
      finally  { setLoading(false); }
    };
    fetch();
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
          <input className="filtro-busca" type="text" placeholder="Buscar jogador..."
            value={busca} onChange={e => setBusca(e.target.value)} />
          <div className="filtro-grupo">
            {posicoes.map(p => (
              <button key={p} className={`filtro-btn ${filtroPosicao===p?"ativo":""}`}
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
            <CartaFifa key={j.id_jogador ?? j.id} jogador={j} todos={jogadores} showBadge={false} />
          ))}
        </div>
      </div>
    </Layout>
  );
}