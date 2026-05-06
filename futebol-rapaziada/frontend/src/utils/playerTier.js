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

  // ── 3. AZUL — Garçom (1º em assistências) ────────────────────────────────
  // ⚠️ CORRIGIDO: era laranja, mas no planejamento Azul = Garçom
  const porAssists = [...todos].sort((a, b) => (b.assistencias ?? 0) - (a.assistencias ?? 0));
  if (getId(porAssists[0]) === id && (player.assistencias ?? 0) > 0) return "azul";

  // ── 4. VERDE — Paredão (1º em defesas entre GOLEIROS) ────────────────────
  const goleiros = todos.filter(j => GOLEIROS.includes(j.posicao));
  if (goleiros.length > 0 && GOLEIROS.includes(player.posicao)) {
    const porDefesasGol = [...goleiros].sort((a, b) => (b.defesas ?? 0) - (a.defesas ?? 0));
    if (getId(porDefesasGol[0]) === id && (player.defesas ?? 0) > 0) return "verde";
  }

  // ── 5. LARANJA — Xerife (1º em desarmes entre NÃO-GOLEIROS) ──────────────
  // ⚠️ CORRIGIDO: era azul, mas no planejamento Laranja = Xerife
  const naoGoleiros = todos.filter(j => NAO_GOLEIROS.includes(j.posicao));
  if (naoGoleiros.length > 0 && NAO_GOLEIROS.includes(player.posicao)) {
    const porDesarmes = [...naoGoleiros].sort((a, b) => (b.desarmes ?? b.defesas ?? 0) - (a.desarmes ?? a.defesas ?? 0));
    if (getId(porDesarmes[0]) === id && (player.desarmes ?? player.defesas ?? 0) > 0) return "laranja";
  }

  // ── 6. Por overall ────────────────────────────────────────────────────────
  return getTipoPorOverall(player);
}

export function getTipoPorOverall(player) {
  const ovr = Number(player?.overall ?? 0);
  if (ovr === 0)  return "preto";
  if (ovr >= 75)  return "ouro";   // ⚠️ CORRIGIDO: era 71 → agora 75
  if (ovr >= 65)  return "prata";  // ⚠️ CORRIGIDO: era 51 → agora 65
  return "bronze";                 // 1–64
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
  vermelho: { badge: "🔴 GOAT",       sub: "1º no Campeonato"      },
  roxo:     { badge: "🟣 Artilheiro", sub: "Líder em Gols"         },
  azul:     { badge: "🔵 Garçom",     sub: "Líder em Assistências" }, // ⚠️ CORRIGIDO
  verde:    { badge: "🟢 Paredão",    sub: "Melhor Goleiro"        },
  laranja:  { badge: "🟠 Xerife",     sub: "Melhor Defesa"         }, // ⚠️ CORRIGIDO
  ouro:     { badge: "🥇 Ouro",       sub: "Overall 75–99"         }, // ⚠️ CORRIGIDO
  prata:    { badge: "🥈 Prata",      sub: "Overall 65–74"         }, // ⚠️ CORRIGIDO
  bronze:   { badge: "🥉 Bronze",     sub: "Overall 1–64"          }, // ⚠️ CORRIGIDO
  preto:    { badge: "⬛ Novato",     sub: "Overall 0"             },
};