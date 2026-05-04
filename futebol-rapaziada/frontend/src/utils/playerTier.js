// src/utils/playerTier.js
// ─── Utilitário compartilhado de tier ────────────────────────────────────────

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

function getId(j) { return j?.id_jogador ?? j?.id; }

const GOLEIROS     = ["Goleiro"];
const NAO_GOLEIROS = ["Zagueiro","Lateral Direito","Lateral Esquerdo","Meia","Centroavante"];

export function getTipo(player, todos) {
  if (!todos || todos.length === 0) return getTipoPorOverall(player);

  const id = getId(player);

  // ── 1. VERMELHO — 1º no campeonato por pontos ─────────────────────────────
  const porPontos = [...todos].sort((a, b) => calcPontos(b) - calcPontos(a));
  if (getId(porPontos[0]) === id) return "vermelho";

  // ── 2. ROXO — Artilheiro (1º em gols) ────────────────────────────────────
  const porGols = [...todos].sort((a, b) => (b.gols ?? 0) - (a.gols ?? 0));
  if (getId(porGols[0]) === id && (player.gols ?? 0) > 0) return "roxo";

  // ── 3. LARANJA — Garçom (1º em assistências) ─────────────────────────────
  const porAssists = [...todos].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  if (getId(porAssists[0]) === id && (player.assistencias ?? 0) > 0) return "laranja";

  // ── 4. VERDE — Paredão (1º em defesas entre GOLEIROS) ────────────────────
  const goleiros = todos.filter(j => GOLEIROS.includes(j.posicao));
  if (goleiros.length > 0 && GOLEIROS.includes(player.posicao)) {
    const porDefesasGol = [...goleiros].sort((a, b) => (b.defesas ?? 0) - (a.defesas ?? 0));
    if (getId(porDefesasGol[0]) === id && (player.defesas ?? 0) > 0) return "verde";
  }

  // ── 5. AZUL — Xerife (1º em defesas entre NÃO-GOLEIROS) ──────────────────
  const naoGoleiros = todos.filter(j => NAO_GOLEIROS.includes(j.posicao));
  if (naoGoleiros.length > 0 && NAO_GOLEIROS.includes(player.posicao)) {
    const porDefesasNaoGol = [...naoGoleiros].sort((a, b) => (b.defesas ?? 0) - (a.defesas ?? 0));
    if (getId(porDefesasNaoGol[0]) === id && (player.defesas ?? 0) > 0) return "azul";
  }

  // ── 6. Por overall ────────────────────────────────────────────────────────
  return getTipoPorOverall(player);
}

export function getTipoPorOverall(player) {
  const ovr = Number(player?.overall ?? 0);
  if (ovr === 0)  return "preto";
  if (ovr >= 71)  return "ouro";
  if (ovr >= 51)  return "prata";
  return "bronze";
}

// ─── COR DOS ATRIBUTOS ────────────────────────────────────────────────────────
export function atribColor(v) {
  if (v >= 70) return "#00ff87";
  if (v >= 50) return "#ffd166";
  return "#ff4d6d";
}

// ─── ATRIBUTOS POR POSIÇÃO ────────────────────────────────────────────────────
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

// ─── TIER INFO ────────────────────────────────────────────────────────────────
export const TIER_INFO = {
  vermelho: { badge: "🔴 GOAT",     sub: "1º no Campeonato"   },
  roxo:     { badge: "🟣 Artilheiro", sub: "Líder em Gols"    },
  laranja:  { badge: "🟠 Garçom",   sub: "Líder em Assistências" },
  verde:    { badge: "🟢 Paredão",  sub: "Melhor Goleiro"     },
  azul:     { badge: "🔵 Xerife",   sub: "Melhor Defesa"      },
  ouro:     { badge: "🥇 Ouro",     sub: "Overall 71–99"      },
  prata:    { badge: "🥈 Prata",    sub: "Overall 51–70"      },
  bronze:   { badge: "🥉 Bronze",   sub: "Overall 1–50"       },
  preto:    { badge: "⬛ Novato",   sub: "Overall 0"          },
};