import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores } from "../services/api.js";
import Layout from "../components/layout/Layout.jsx";
import "../style/Estatisticas.css";

const ABAS = ["Geral","Artilheiro","Garçom","Participação","Defesa","Presença"];

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

  const isEu = j => j.nome?.toLowerCase() === usuarioLogado?.nome?.toLowerCase();

  function medalha(i) {
    if(i===0)return"🥇";if(i===1)return"🥈";if(i===2)return"🥉";return`${i+1}º`;
  }

  function posicaoNo(lista) {
    const idx = lista.findIndex(j=>isEu(j));
    return idx>=0?`${idx+1}º`:"—";
  }

  function RankCard({ titulo, icone, lista, renderVal }) {
    return (
      <div className="rank-card">
        <div className="rc-header"><span>{icone}</span><h3>{titulo}</h3></div>
        <div className="rc-lista">
          {lista.slice(0,10).map((j,i)=>(
            <div key={j.id??i} className={`rc-item ${isEu(j)?"eu":""}`}>
              <span className="rc-pos">{medalha(i)}</span>
              <div className="rc-info">
                <span className="rc-nome">{j.nome?.split(" ")[0]}{isEu(j)&&<span className="tag-eu">você</span>}</span>
                <span className="rc-posicao">{j.posicao||"—"}</span>
              </div>
              <span className="rc-val">{renderVal(j)}</span>
            </div>
          ))}
        </div>
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

        <div className="ranks-grid">
          {aba==="Geral"&&<>
            <RankCard titulo="Artilheiros"  icone="⚽" lista={porGols}         renderVal={j=>`${j.gols??0} G`}/>
            <RankCard titulo="Garçons"       icone="🎯" lista={porAssistencias} renderVal={j=>`${j.assistencias??0} A`}/>
            <RankCard titulo="Participação" icone="🔥" lista={porParticipacao} renderVal={j=>`${(j.gols??0)+(j.assistencias??0)} G+A`}/>
            <RankCard titulo="Mais Jogos"   icone="🏟" lista={porJogos}        renderVal={j=>`${j.jogos??0} JG`}/>
            <RankCard titulo="Cartões"      icone="🟨" lista={porCartoes}      renderVal={j=>`${j.cartoes??0} C`}/>
            <RankCard titulo="Overall"      icone="⭐" lista={porOverall}      renderVal={j=>`${j.overall??0} OVR`}/>
          </>}
          {aba==="Artilheiro"&&<RankCard titulo="Artilheiros" icone="⚽" lista={porGols} renderVal={j=>`${j.gols??0} gols`}/>}
          {aba==="Garçom"    &&<RankCard titulo="Garçons"      icone="🎯" lista={porAssistencias} renderVal={j=>`${j.assistencias??0} ass.`}/>}
          {aba==="Participação"&&<RankCard titulo="G+A" icone="🔥" lista={porParticipacao} renderVal={j=>`${(j.gols??0)+(j.assistencias??0)} G+A`}/>}
          {aba==="Defesa"    &&<RankCard titulo="Menos Cartões" icone="🧱" lista={[...jogadores].filter(j=>(j.jogos??0)>0).sort((a,b)=>(a.cartoes??0)-(b.cartoes??0))} renderVal={j=>`${j.cartoes??0} cart.`}/>}
          {aba==="Presença"  &&<RankCard titulo="Mais Jogos" icone="🏟" lista={porJogos} renderVal={j=>`${j.jogos??0} jogos`}/>}
        </div>

      </div>
    </Layout>
  );
}