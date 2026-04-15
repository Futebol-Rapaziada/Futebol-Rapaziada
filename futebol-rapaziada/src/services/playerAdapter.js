export function mapJogador(j) {
  return {
    id: j.id,
    nome: j.nome,
    posicao: j.posicao,
    idade: j.idade,
    perna: j.perna_boa,

    overall: j.overall ?? 75,
    gols: j.gols ?? 0,
    assistencias: j.assistencias ?? 0,
    jogos: j.jogos ?? 0,

    fotoUrl: "",
  };
}