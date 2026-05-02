// src/utils/playerTier.js
// ─── Utilitário compartilhado de tier de jogadores ───────────────────────────
// Importado por Home.jsx e Jogadores.jsx para garantir lógica idêntica.

const PONTOS = {
  gol: 3, assistencia: 2, defesa: 2, vitoria: 5, cartao_am: -1, cartao_vm: -3,
};

export function calcPontos(j) {
  return (
    (j.gols              ?? 0) * PONTOS.gol        +
    (j.assistencias      ?? 0) * PONTOS.assistencia +
    (j.defesas           ?? 0) * PONTOS.defesa      +
    (j.vitorias          ?? 0) * PONTOS.vitoria     +
    (j.cartoes           ?? 0) * PONTOS.cartao_am   +
    (j.cartoes_vermelhos ?? 0) * PONTOS.cartao_vm
  );
}

function getId(j) {
  return j?.id_jogador ?? j?.id;
}

export function getTipo(player, todos) {
  if (!todos || todos.length === 0) return getTipoPorOverall(player);

  const id = getId(player);

  // 1. Legend = 1º no campeonato por pontos
  const porPontos = [...todos].sort((a, b) => calcPontos(b) - calcPontos(a));
  if (getId(porPontos[0]) === id) return "legend";

  // 2. Champion = 1º em gols, assistências ou G+A
  const porGols    = [...todos].sort((a, b) => (b.gols ?? 0) - (a.gols ?? 0));
  const porAssists = [...todos].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  const porGa      = [...todos].sort((a, b) =>
    ((b.gols ?? 0) + (b.assistencias ?? 0)) - ((a.gols ?? 0) + (a.assistencias ?? 0))
  );

  if (
    getId(porGols[0])    === id ||
    getId(porAssists[0]) === id ||
    getId(porGa[0])      === id
  ) return "champion";

  // 3. Por overall
  return getTipoPorOverall(player);
}

export function getTipoPorOverall(player) {
  const ovr = Number(player?.overall ?? 0);
  if (ovr >= 75) return "ouro";
  if (ovr >= 50) return "prata";
  return "bronze";
}

// Cor dos atributos
export function atribColor(v) {
  if (v >= 70) return "#00ff87";
  if (v >= 50) return "#ffd166";
  return "#ff4d6d";
}

// Atributos por posição (goleiro tem stats diferentes)
export function getAtribs(jogador) {
  if (jogador?.posicao === "Goleiro") {
    return [
      { k: "pac", l: "DIV", v: jogador.pac ?? 0 },
      { k: "sho", l: "HAN", v: jogador.sho ?? 0 },
      { k: "pas", l: "KIC", v: jogador.pas ?? 0 },
      { k: "dri", l: "REF", v: jogador.dri ?? 0 },
      { k: "def", l: "SPE", v: jogador.def ?? 0 },
      { k: "phy", l: "POS", v: jogador.phy ?? 0 },
    ];
  }
  return [
    { k: "pac", l: "PAC", v: jogador.pac ?? 0 },
    { k: "sho", l: "SHO", v: jogador.sho ?? 0 },
    { k: "pas", l: "PAS", v: jogador.pas ?? 0 },
    { k: "dri", l: "DRI", v: jogador.dri ?? 0 },
    { k: "def", l: "DEF", v: jogador.def ?? 0 },
    { k: "phy", l: "PHY", v: jogador.phy ?? 0 },
  ];
}

// Tier info (badge + sub)
export const TIER_INFO = {
  legend:   { badge: "🌟 Legend",   sub: "1º no Campeonato" },
  champion: { badge: "👑 Champion", sub: "Líder em Pódio"   },
  ouro:     { badge: "🥇 Ouro",     sub: "Overall 75–99"    },
  prata:    { badge: "🥈 Prata",    sub: "Overall 50–74"    },
  bronze:   { badge: "🥉 Bronze",   sub: "Overall 0–49"     },
};
