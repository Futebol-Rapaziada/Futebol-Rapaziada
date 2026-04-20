import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores, deletarJogador } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Home.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";
const POSICOES = ["Goleiro","Zagueiro","Lateral Direito","Lateral Esquerdo","Meia","Centroavante"];

function getTipo(ovr) {
  const v = Number(ovr ?? 0);
  if (v >= 67) return "lenda";
  if (v >= 34) return "ouro";
  return "bronze";
}

function atribColor(v) {
  if (v >= 70) return "#00ff87";
  if (v >= 50) return "#ffd166";
  return "#ff4d6d";
}

export default function Home() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));
  const [player, setPlayer]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [painel, setPainel]   = useState(false);
  const [salvando, setSalv]   = useState(false);
  const [msg, setMsg]         = useState({ tipo: "", texto: "" });
  const [form, setForm]       = useState({ nome:"",posicao:"",idade:"",perna_boa:"Direita",fotoUrl:"",gols:0,assistencias:0,jogos:0,cartoes:0 });

  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    carregar();
  }, []);

  async function carregar() {
    try {
      const todos = await getJogadores();
      const meu = todos.find(j => j.nome?.toLowerCase() === usuarioLogado.nome?.toLowerCase());
      if (meu) { setPlayer(meu); preencherForm(meu); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  function preencherForm(j) {
    setForm({ nome:j.nome??"", posicao:j.posicao??"", idade:j.idade??"", perna_boa:j.perna_boa??"Direita", fotoUrl:j.fotoUrl??"", gols:j.gols??0, assistencias:j.assistencias??0, jogos:j.jogos??0, cartoes:j.cartoes??0 });
  }

  const set = campo => e => setForm(o => ({ ...o, [campo]: e.target.value }));
  const adj = (campo, d) => setForm(o => ({ ...o, [campo]: Math.max(0, Number(o[campo]) + d) }));

  async function salvar() {
    if (!player) return;
    setSalv(true); setMsg({tipo:"",texto:""});
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/jogadores/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ ...form, idade:Number(form.idade), gols:Number(form.gols), assistencias:Number(form.assistencias), jogos:Number(form.jogos), cartoes:Number(form.cartoes) }),
      });
      if (!res.ok) throw new Error();
      setMsg({ tipo:"ok", texto:"Perfil atualizado!" });
      await carregar();
      setTimeout(() => { setMsg({tipo:"",texto:""}); setPainel(false); }, 1500);
    } catch { setMsg({ tipo:"err", texto:"Erro ao salvar." }); }
    finally { setSalv(false); }
  }

  async function deletar() {
    if (!player?.id || !window.confirm("Deletar seu perfil?")) return;
    await deletarJogador(player.id);
    localStorage.removeItem("user"); localStorage.removeItem("token");
    navigate("/");
  }

  if (loading) return <Layout><div className="loading-screen"><div className="loading-ball">⚽</div></div></Layout>;
  if (!player) return <Layout><div className="loading-screen"><p>Nenhum perfil encontrado.</p></div></Layout>;

  const tipo = getTipo(player.overall);
  const atribs = [
    { k:"pac", l:"PAC", v:player.pac??0 }, { k:"sho", l:"SHO", v:player.sho??0 }, { k:"pas", l:"PAS", v:player.pas??0 },
    { k:"dri", l:"DRI", v:player.dri??0 }, { k:"def", l:"DEF", v:player.def??0 }, { k:"phy", l:"PHY", v:player.phy??0 },
  ];

  return (
    <Layout>
      <div className="home-wrap">

        {/* ── LINHA PRINCIPAL ── */}
        <div className="home-row">

          {/* CARTA FIFA */}
          <div className="carta-wrap">
            <div className={`carta carta-${tipo}`}>
              {tipo==="lenda" && <div className="carta-bg-lenda"><div className="orb o1"/><div className="orb o2"/></div>}
              {tipo==="ouro"  && <div className="carta-bg-ouro"><div className="s1"/><div className="s2"/></div>}
              {tipo==="bronze"&& <div className="carta-bg-bronze"><div className="b1"/><div className="b2"/></div>}

              <div className="carta-top z1">
                <div className="carta-ovr">{player.overall||"0"}</div>
                <div className="carta-pos">{player.posicao||"—"}</div>
                <div className="carta-flag">🇧🇷</div>
              </div>

              <div className="carta-foto z1">
                {player.fotoUrl ? <img src={player.fotoUrl} alt={player.nome}/> : <span>👤</span>}
              </div>

              <div className="carta-nome z1">{player.nome?.split(" ")[0]?.toUpperCase()}</div>
              <div className="carta-div z1"/>

              <div className="carta-atribs z1">
                <div className="atrib-col">
                  {atribs.slice(0,3).map(a=>(
                    <div key={a.k} className="atrib">
                      <span className="av" style={{color:atribColor(a.v)}}>{a.v}</span>
                      <span className="al">{a.l}</span>
                    </div>
                  ))}
                </div>
                <div className="atrib-sep"/>
                <div className="atrib-col">
                  {atribs.slice(3).map(a=>(
                    <div key={a.k} className="atrib">
                      <span className="av" style={{color:atribColor(a.v)}}>{a.v}</span>
                      <span className="al">{a.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`tier-badge tier-${tipo}`}>
              {tipo==="lenda"?"⭐ Lenda · 67–99":tipo==="ouro"?"🥇 Ouro · 34–66":"🔩 Comum · 0–33"}
            </div>
          </div>

          {/* INFO */}
          <div className="home-info">
            <div className="info-topo">
              <h1 className="info-nome">{player.nome}</h1>
              <div className="info-tags">
                <span className="tag neon-tag">{player.posicao||"—"}</span>
                <span className="tag">🦵 {player.perna_boa||"—"}</span>
                <span className="tag">🎂 {player.idade||"—"} anos</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="quick-grid">
              {[
                { i:"⚽", v:player.gols??0,       l:"Gols" },
                { i:"🎯", v:player.assistencias??0, l:"Assist." },
                { i:"🏟", v:player.jogos??0,        l:"Jogos" },
                { i:"🟨", v:player.cartoes??0,      l:"Cartões" },
                { i:"🔥", v:(player.gols??0)+(player.assistencias??0), l:"G+A" },
                { i:"⭐", v:player.overall??0,      l:"Overall" },
              ].map(({i,v,l})=>(
                <div key={l} className="qs-card">
                  <span className="qs-i">{i}</span>
                  <span className="qs-v">{v}</span>
                  <span className="qs-l">{l}</span>
                </div>
              ))}
            </div>

            <div className="home-btns">
              <button className="btn-neon" onClick={()=>setPainel(true)}>✏️ Editar Perfil</button>
              <button className="btn-danger" onClick={deletar}>🗑 Deletar</button>
            </div>
          </div>
        </div>

        {/* ── CARDS INFO ── */}
        <div className="info-grid">
          <div className="info-card">
            <div className="ic-header"><span>👕</span><h3>Time</h3></div>
            <div className="ic-body"><p className="ic-val">{player.time||"Sem time"}</p></div>
          </div>

          <div className={`info-card ${player.confirmado?"ic-green":"ic-red"}`}>
            <div className="ic-header"><span>{player.confirmado?"✅":"❌"}</span><h3>Próximo Jogo</h3></div>
            <div className="ic-body"><p className="ic-val">{player.confirmado?"Confirmado":"Não confirmado"}</p></div>
          </div>

          <div className="info-card">
            <div className="ic-header"><span>🏆</span><h3>Campeonato</h3></div>
            <div className="ic-body">
              <p className="ic-val">Temporada 2026</p>
              <p className="ic-sub">Modo Carreira</p>
            </div>
          </div>

          <div className="info-card">
            <div className="ic-header"><span>📈</span><h3>Desempenho</h3></div>
            <div className="ic-body">
              {[
                { l:"Média Gols",  v: player.jogos>0?(player.gols/player.jogos).toFixed(2):"0.00" },
                { l:"Média Ass.",  v: player.jogos>0?(player.assistencias/player.jogos).toFixed(2):"0.00" },
                { l:"G+A / Jogo",  v: player.jogos>0?(((player.gols??0)+(player.assistencias??0))/player.jogos).toFixed(2):"0.00" },
              ].map(({l,v})=>(
                <div key={l} className="desemp-row">
                  <span className="d-lbl">{l}</span>
                  <span className="d-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── PAINEL ── */}
      {painel && (
        <div className="overlay" onClick={()=>setPainel(false)}>
          <div className="painel" onClick={e=>e.stopPropagation()}>
            <div className="p-header">
              <h2>Editar Perfil</h2>
              <button className="p-close" onClick={()=>setPainel(false)}>✕</button>
            </div>

            <div className="p-section">
              <p className="p-label">Dados</p>
              <label className="p-fl">Nome</label>
              <input className="p-input" value={form.nome} onChange={set("nome")}/>
              <label className="p-fl">URL da foto</label>
              <input className="p-input" placeholder="https://..." value={form.fotoUrl} onChange={set("fotoUrl")}/>
              <label className="p-fl">Posição</label>
              <select className="p-input" value={form.posicao} onChange={set("posicao")}>
                {POSICOES.map(p=><option key={p}>{p}</option>)}
              </select>
              <div className="p-row">
                <div className="p-col">
                  <label className="p-fl">Idade</label>
                  <input className="p-input" type="number" min="5" max="99" value={form.idade} onChange={set("idade")}/>
                </div>
                <div className="p-col">
                  <label className="p-fl">Perna boa</label>
                  <select className="p-input" value={form.perna_boa} onChange={set("perna_boa")}>
                    <option>Direita</option><option>Esquerda</option><option>Ambas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-section">
              <p className="p-label">Estatísticas</p>
              <p className="p-obs">⭐ Overall e atributos FIFA são definidos pela administração.</p>
              {[
                {k:"gols",l:"Gols"},{k:"assistencias",l:"Assistências"},
                {k:"jogos",l:"Jogos"},{k:"cartoes",l:"Cartões"},
              ].map(({k,l})=>(
                <div key={k} className="stat-row">
                  <span className="sr-lbl">{l}</span>
                  <div className="sr-ctrl">
                    <button className="sr-btn" onClick={()=>adj(k,-1)}>−</button>
                    <span className="sr-val">{form[k]}</span>
                    <button className="sr-btn" onClick={()=>adj(k,+1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {msg.texto && <div className={`msg ${msg.tipo==="ok"?"msg-ok":"msg-err"}`}>{msg.texto}</div>}

            <button className="btn-salvar" onClick={salvar} disabled={salvando}>
              {salvando?"Salvando...":"Salvar alterações"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}