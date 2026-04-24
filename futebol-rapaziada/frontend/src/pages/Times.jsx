import { useEffect, useState } from "react";
import { getJogadores } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Times.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

const POSICOES_CAMPO = [
  { key:"gol",  label:"GOL",  x:"50%", y:"87%" },
  { key:"zag1", label:"ZAG",  x:"33%", y:"72%" },
  { key:"zag2", label:"ZAG",  x:"67%", y:"72%" },
  { key:"ala1", label:"ALA",  x:"18%", y:"52%" },
  { key:"ala2", label:"ALA",  x:"82%", y:"52%" },
  { key:"meia", label:"MEIA", x:"50%", y:"45%" },
  { key:"atq",  label:"ATQ",  x:"50%", y:"22%" },
];

const RESERVAS_SLOTS = [0, 1, 2];

export default function Times() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [salvando, setSalvando]   = useState(false);
  const [sucesso, setSucesso]     = useState("");

  const [timeA, setTimeA] = useState({ gol:"",zag1:"",zag2:"",ala1:"",ala2:"",meia:"",atq:"" });
  const [timeB, setTimeB] = useState({ gol:"",zag1:"",zag2:"",ala1:"",ala2:"",meia:"",atq:"" });
  const [resA,  setResA]  = useState(["","",""]);
  const [resB,  setResB]  = useState(["","",""]);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const [jogs, timesResp] = await Promise.all([
        getJogadores(),
        fetch(`${API_URL}/times-jogo`).then(r=>r.ok?r.json():[]).catch(()=>[]),
      ]);
      setJogadores(jogs);

      if (timesResp.length >= 1) {
        const montar = (esc) => {
          const m = {};
          (esc||[]).filter(e=>!e.reserva).forEach(e => { m[e.posicao_campo] = String(e.jogador_id||""); });
          return m;
        };
        if (timesResp[0]) setTimeA(old=>({...old,...montar(timesResp[0].escalacao)}));
        if (timesResp[1]) setTimeB(old=>({...old,...montar(timesResp[1].escalacao)}));

        const getRes = (esc) => {
          const r = (esc||[]).filter(e=>e.reserva && e.jogador_id).map(e=>String(e.jogador_id));
          return [r[0]||"", r[1]||"", r[2]||""];
        };
        if (timesResp[0]) setResA(getRes(timesResp[0].escalacao));
        if (timesResp[1]) setResB(getRes(timesResp[1].escalacao));
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  function alterarTime(time, pos, val) {
    if (time==="A") setTimeA(o=>({...o,[pos]:val}));
    else setTimeB(o=>({...o,[pos]:val}));
  }

  function alterarReserva(time, idx, val) {
    if (time==="A") setResA(o=>{ const n=[...o]; n[idx]=val; return n; });
    else setResB(o=>{ const n=[...o]; n[idx]=val; return n; });
  }

  function nomeJogador(id) {
    if (!id) return "";
    const j = jogadores.find(j=>String(j.id)===String(id));
    return j ? j.nome.split(" ")[0] : "";
  }

  function fotoJogador(id) {
    if (!id) return null;
    const j = jogadores.find(j=>String(j.id)===String(id));
    return j?.fotoUrl || null;
  }

  async function salvar() {
    setSalvando(true); setSucesso("");
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) };

      let timesResp = await fetch(`${API_URL}/times-jogo`).then(r=>r.ok?r.json():[]).catch(()=>[]);

      const NOMES = ["Time Verde","Time Vermelho"];
      const CORES = ["#00ff87","#ff4d6d"];
      for (let i = timesResp.length; i < 2; i++) {
        const r = await fetch(`${API_URL}/times-jogo`, { method:"POST", headers, body:JSON.stringify({nome:NOMES[i],cor:CORES[i]}) });
        const n = await r.json();
        timesResp.push({ id: n.id });
      }

      const montar = (esc, res) => [
        ...POSICOES_CAMPO.map(p=>({ posicao_campo:p.key, id_jogador:esc[p.key]||null, reserva:0 })),
        ...res.filter(Boolean).map(id=>({ posicao_campo:"reserva", id_jogador:id, reserva:1 })),
      ];

      await fetch(`${API_URL}/escalacao`, { method:"POST", headers, body:JSON.stringify({ id_time:timesResp[0].id, slots:montar(timeA,resA) }) });
      await fetch(`${API_URL}/escalacao`, { method:"POST", headers, body:JSON.stringify({ id_time:timesResp[1].id, slots:montar(timeB,resB) }) });

      setSucesso("✓ Escalação salva com sucesso!");
      setTimeout(()=>setSucesso(""), 3000);
    } catch(e) { console.error(e); }
    finally { setSalvando(false); }
  }

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div></div></Layout>;

  // No componente Campo, adicione a prop 'time' para identificar o lado
function Campo({ titulo, cor, dados, reservas, time }) {
  const escalados = Object.values(dados).filter(Boolean);

  return (
    <div className="time-col">
      <div className="time-header" style={{ borderColor: cor }}>
        <h2 className="time-titulo" style={{ color: cor }}>{titulo}</h2>
        <span className="time-placar">{escalados.length} / 7</span>
      </div>

      <div className="campo-container">
        <div className="campo">
          <div className="campo-linha-meio" />
          <div className="campo-circulo-meio" />
          
          {POSICOES_CAMPO.map(pos => {
            const jogId = dados[pos.key];
            const nome = nomeJogador(jogId);
            const foto = fotoJogador(jogId);
            
            return (
              <div 
                key={pos.key} 
                className="slot-container" 
                style={{ left: pos.x, top: pos.y, '--cor': cor }}
              >
                <div className="slot-avatar" style={{ borderColor: jogId ? cor : "rgba(255,255,255,.2)" }}>
                  {foto ? (
                    <img src={foto} alt={nome} />
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {pos.label[0]}
                    </span>
                  )}
                </div>
                
                {nome && <span className="slot-nome-badge">{nome}</span>}

                <select
                  className="slot-select"
                  value={jogId}
                  onChange={e => alterarTime(time, pos.key, e.target.value)}
                >
                  <option value="">{pos.label}</option>
                  {jogadores.map(j => (
                    <option key={j.id} value={j.id}>{j.nome}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="reservas-box" style={{ borderColor: `${cor}40`, color: cor }}>
        <p>🪑 Reservas</p>
        <div className="reservas-selects">
          {RESERVAS_SLOTS.map(i => (
            <select 
              key={i} 
              className="res-select" 
              value={reservas[i]} 
              onChange={e => alterarReserva(time, i, e.target.value)}
            >
              <option value="">+</option>
              {jogadores.map(j => (
                <option key={j.id} value={j.id}>{j.nome.split(" ")[0]}</option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  );
}

  return (
    <Layout>
      <div className="times-page">
        <div className="times-page-header">
          <h1 className="page-titulo">Montagem dos Times</h1>
          <p className="page-sub">Configure a escalação para o próximo jogo</p>
        </div>

        {sucesso && <div className="times-sucesso">{sucesso}</div>}

        <div className="times-grid">
          <Campo titulo="Time Verde"    cor="#00ff87" dados={timeA} reservas={resA} time="A"/>
          <Campo titulo="Time Vermelho" cor="#ff4d6d" dados={timeB} reservas={resB} time="B"/>
        </div>

        <div className="times-footer">
          <button className="btn-salvar-times" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "💾 Salvar Escalação"}
          </button>
        </div>
      </div>
    </Layout>
  );
}