import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api.js";
import Layout from "../components/layout/Layout.jsx";
import "../style/Estatisticas.css";

const ABAS = ["Geral","Artilheiro","Garçom","Participação","Defesa","Presença"];

function Podio({ lista, campo, renderVal, titulo, icone }) {
  const top = lista.slice(0, 3);

  // ordem visual: 2º (esquerda), 1º (centro/alto), 3º (direita)
  const ordemVisual = [1, 0, 2];
  const alturas     = ["75px", "115px", "50px"];
  const cores       = ["#9ca3af", "#ffd166", "#cd7c2f"];
  const medalhas    = ["🥈 2º", "🥇 1º", "🥉 3º"];

  return (
    <div className="podio-card">
      <div className="podio-titulo"><span>{icone}</span><h3>{titulo}</h3></div>
      <div className="podio-palco">
        {ordemVisual.map((pos, i) => {
          const j = top[pos];
          if (!j) return <div key={i} className="podio-slot vazio" style={{ height: alturas[i] }} />;
          return (
            <div key={i} className={`podio-slot ${i === 1 ? "podio-primeiro" : ""}`}>
              {i === 1 && <div className="podio-coroa">👑</div>}
              <div className="podio-foto" style={{ borderColor: cores[i] }}>
                {j.fotoUrl
                  ? <img src={j.fotoUrl} alt={j.nome} />
                  : <span>👤</span>
                }
              </div>
              <p className="podio-nome">{j.nome?.split(" ")[0]}</p>
              <p className="podio-val" style={{ color: cores[i] }}>{renderVal(j)}</p>
              <div className="podio-base" style={{ height: alturas[i], background: cores[i] }}>
                <span className="podio-label">{medalhas[i]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Estatisticas() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aba, setAba]             = useState("Geral");

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    getJogadores().then(setJogadores).catch(console.error).finally(() => setLoading(false));
  }, []);

  const porGols         = [...jogadores].sort((a,b)=>(b.gols??0)-(a.gols??0));
  const porAssistencias = [...jogadores].sort((a,b)=>(b.assistencias??0)-(a.assistencias??0));
  const porParticipacao = [...jogadores].sort((a,b)=>((b.gols??0)+(b.assistencias??0))-((a.gols??0)+(a.assistencias??0)));
  const porJogos        = [...jogadores].sort((a,b)=>(b.jogos??0)-(a.jogos??0));
  const porCartoes      = [...jogadores].sort((a,b)=>(b.cartoes??0)-(a.cartoes??0));
  const porOverall      = [...jogadores].sort((a,b)=>(b.overall??0)-(a.overall??0));
  const menosCartoes    = [...jogadores].filter(j=>(j.jogos??0)>0).sort((a,b)=>(a.cartoes??0)-(b.cartoes??0));

  const isEu = j => j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();

  function medalha(i) {
    if(i===0)return"🥇"; if(i===1)return"🥈"; if(i===2)return"🥉"; return`${i+1}º`;
  }

  function posicaoNo(lista) {
    const idx = lista.findIndex(j=>isEu(j));
    return idx>=0?`${idx+1}º`:"—";
  }

  function TabelaCompleta() {
    const todos = [...jogadores].sort((a,b)=>((b.gols??0)+(b.assistencias??0))-((a.gols??0)+(a.assistencias??0)));
    return (
      <div className="tabela-wrap">
        <h3 className="tabela-titulo">📋 Tabela Completa</h3>
        <div className="tabela-scroll">
          <table className="estat-tabela">
            <thead>
              <tr>
                <th>#</th><th>Jogador</th><th>Pos.</th>
                <th>JG</th><th>G</th><th>A</th><th>G+A</th><th>🟨</th><th>OVR</th>
              </tr>
            </thead>
            <tbody>
              {todos.map((j,i) => (
                <tr key={j.id??i} className={isEu(j)?"eu":""}>
                  <td className="td-pos">{medalha(i)}</td>
                  <td className="td-nome">
                    {j.fotoUrl
                      ? <img className="tab-foto" src={j.fotoUrl} alt={j.nome}/>
                      : <span className="tab-av">👤</span>
                    }
                    {j.nome?.split(" ")[0]}
                    {isEu(j)&&<span className="tag-eu">você</span>}
                  </td>
                  <td className="td-posicao">{j.posicao||"—"}</td>
                  <td>{j.jogos??0}</td>
                  <td className="td-dest">{j.gols??0}</td>
                  <td className="td-dest">{j.assistencias??0}</td>
                  <td className="td-gpa">{(j.gols??0)+(j.assistencias??0)}</td>
                  <td>{j.cartoes??0}</td>
                  <td><span className="td-ovr">{j.overall??0}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function RankLista({ lista, renderVal }) {
    return (
      <div className="rank-lista-est">
        {lista.slice(0,10).map((j,i) => (
          <div key={j.id??i} className={`rle-item ${isEu(j)?"eu":""}`}>
            <span className="rle-pos">{medalha(i)}</span>
            <div className="rle-info">
              <span className="rle-nome">{j.nome?.split(" ")[0]}{isEu(j)&&<span className="tag-eu">você</span>}</span>
              <span className="rle-posicao">{j.posicao||"—"}</span>
            </div>
            <span className="rle-val">{renderVal(j)}</span>
          </div>
        ))}
      </div>
    );
  }

  const eu = jogadores.find(j=>isEu(j));

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div></div></Layout>;

  return (
    <Layout>
      <div className="estat-wrap">

        {eu && (
          <section className="meus-stats">
            <div className="ms-top">
              <div className="ms-id">
                <span className="ms-ovr">{eu.overall??0}</span>
                <div>
                  <p className="ms-nome">{eu.nome?.split(" ")[0]}</p>
                  <p className="ms-pos">{eu.posicao||"—"}</p>
                </div>
              </div>
              <div className="ms-boxes">
                {[
                  {i:"⚽",v:eu.gols,l:"Gols"},
                  {i:"🎯",v:eu.assistencias,l:"Assists"},
                  {i:"🔥",v:(eu.gols??0)+(eu.assistencias??0),l:"G+A"},
                  {i:"🏟",v:eu.jogos,l:"Jogos"},
                  {i:"🟨",v:eu.cartoes,l:"Cartões"},
                  {i:"⭐",v:eu.overall,l:"Overall"},
                ].map(({i,v,l})=>(
                  <div key={l} className="ms-box">
                    <span className="msb-i">{i}</span>
                    <span className="msb-v">{v??0}</span>
                    <span className="msb-l">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ms-ranks">
              <span>⚽ Artilheiro: <strong>{posicaoNo(porGols)}</strong></span>
              <span>🎯 Garçom: <strong>{posicaoNo(porAssistencias)}</strong></span>
              <span>🔥 G+A: <strong>{posicaoNo(porParticipacao)}</strong></span>
              <span>🏟 Presença: <strong>{posicaoNo(porJogos)}</strong></span>
            </div>
          </section>
        )}

        <div className="abas">
          {ABAS.map(a=>(
            <button key={a} className={`aba-btn ${aba===a?"ativa":""}`} onClick={()=>setAba(a)}>{a}</button>
          ))}
        </div>

        {aba==="Geral" && (
          <div className="estat-conteudo">
            <div className="podios-grid">
              <Podio titulo="Artilheiros"  icone="⚽" lista={porGols}         renderVal={j=>`${j.gols??0} G`}/>
              <Podio titulo="Garçons"       icone="🎯" lista={porAssistencias} renderVal={j=>`${j.assistencias??0} A`}/>
              <Podio titulo="Participação" icone="🔥" lista={porParticipacao} renderVal={j=>`${(j.gols??0)+(j.assistencias??0)} G+A`}/>
              <Podio titulo="Mais Jogos"   icone="🏟" lista={porJogos}        renderVal={j=>`${j.jogos??0} JG`}/>
            </div>
            <TabelaCompleta/>
          </div>
        )}

        {aba==="Artilheiro" && (
          <div className="estat-conteudo">
            <Podio titulo="Artilheiros" icone="⚽" lista={porGols} renderVal={j=>`${j.gols??0} gols`}/>
            <RankLista lista={porGols} renderVal={j=>`${j.gols??0} gols`}/>
          </div>
        )}

        {aba==="Garçom" && (
          <div className="estat-conteudo">
            <Podio titulo="Garçons" icone="🎯" lista={porAssistencias} renderVal={j=>`${j.assistencias??0} ass.`}/>
            <RankLista lista={porAssistencias} renderVal={j=>`${j.assistencias??0} assistências`}/>
          </div>
        )}

        {aba==="Participação" && (
          <div className="estat-conteudo">
            <Podio titulo="Participação (G+A)" icone="🔥" lista={porParticipacao} renderVal={j=>`${(j.gols??0)+(j.assistencias??0)} G+A`}/>
            <RankLista lista={porParticipacao} renderVal={j=>`${(j.gols??0)+(j.assistencias??0)} G+A`}/>
          </div>
        )}

        {aba==="Defesa" && (
          <div className="estat-conteudo">
            <Podio titulo="Menos Cartões" icone="🧱" lista={menosCartoes} renderVal={j=>`${j.cartoes??0} cart.`}/>
            <RankLista lista={menosCartoes} renderVal={j=>`${j.cartoes??0} cartões`}/>
          </div>
        )}

        {aba==="Presença" && (
          <div className="estat-conteudo">
            <Podio titulo="Mais Jogos" icone="🏟" lista={porJogos} renderVal={j=>`${j.jogos??0} jogos`}/>
            <RankLista lista={porJogos} renderVal={j=>`${j.jogos??0} jogos`}/>
          </div>
        )}

      </div>
    </Layout>
  );
}