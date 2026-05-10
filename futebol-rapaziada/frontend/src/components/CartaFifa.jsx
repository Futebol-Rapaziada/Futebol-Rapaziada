// src/components/CartaFifa.jsx
// Componente de carta compartilhado entre Home e Jogadores
import { getTipo, getAtribs, atribColor, TIER_INFO } from "../utils/playerTier";

function CardBg({ tipo }) {
  if (tipo === "vermelho") return <div className="carta-bg-vermelho"><div className="vm1"/><div className="vm2"/><div className="vm3"/></div>;
  if (tipo === "roxo")     return <div className="carta-bg-roxo"><div className="rx1"/><div className="rx2"/><div className="rx3"/></div>;
  if (tipo === "laranja")  return <div className="carta-bg-laranja"><div className="la1"/><div className="la2"/><div className="la3"/></div>;
  if (tipo === "verde")    return <div className="carta-bg-verde"><div className="vd1"/><div className="vd2"/><div className="vd3"/></div>;
  if (tipo === "azul")     return <div className="carta-bg-azul"><div className="az1"/><div className="az2"/><div className="az3"/></div>;
  if (tipo === "ouro")     return <div className="carta-bg-ouro"><div className="s1"/><div className="s2"/></div>;
  if (tipo === "prata")    return <div className="carta-bg-prata"><div className="p1"/><div className="p2"/></div>;
  if (tipo === "bronze")   return <div className="carta-bg-bronze"><div className="b1"/><div className="b2"/></div>;
  return <div className="carta-bg-preto"/>;
}

const CROWN = {
  vermelho: { icon: "♛", style: {} },
  roxo:     { icon: "⚽", style: {} },
  laranja:  { icon: "🎯", style: {} },
  verde:    { icon: "🧤", style: {} },
  azul:     { icon: "🛡", style: {} },
};

export default function CartaFifa({ jogador, todos, showBadge = true }) {
  const tipo   = getTipo(jogador, todos);
  const atribs = getAtribs(jogador);
  const tier   = TIER_INFO[tipo];
  const crown  = CROWN[tipo];

  return (
    <div className="carta-wrap">
      <div className={`carta carta-${tipo}`}>
        <CardBg tipo={tipo} />

        {crown && (
          <div className="carta-crown z1" style={crown.style}>{crown.icon}</div>
        )}

        <div className="carta-top z1">
          <div className="carta-ovr">{jogador.overall || "0"}</div>
          <div className="carta-pos">{jogador.posicao || "—"}</div>
          <div className="carta-flag">🇧🇷</div>
        </div>

        <div className="carta-foto z1">
          {jogador.fotoUrl
            ? <img src={jogador.fotoUrl} alt={jogador.nome}/>
            : <span>👤</span>
          }
        </div>

        {/* ✅ Removido .split(" ")[0] — o nome já vem processado de quem chama o componente.
            Jogadores.jsx passa "Gabriel Jader" quando há duplicatas; caso único continua "Gabriel". */}
        <div className="carta-nome z1">{jogador.nome?.toUpperCase()}</div>
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

      {showBadge && (
        <div className={`tier-badge tier-${tipo}`}>
          <span>{tier.badge}</span>
          <span className="tier-sub">· {tier.sub}</span>
        </div>
      )}
    </div>
  );
}