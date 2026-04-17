const API_URL = "http://192.168.3.247:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.erro || data?.mensagem || "Erro na requisição");
  }

  return data;
}

/* =========================
   JOGADORES
========================= */

export async function getJogadores() {
  return await request("/jogadores");
}

export async function criarJogador(jogador) {
  return await request("/jogadores", {
    method: "POST",
    body: JSON.stringify(jogador),
  });
}

export async function deletarJogador(id) {
  return await request(`/jogadores/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   LOGIN / CADASTRO
========================= */

export async function login(email, senha) {
  return await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function cadastro(nome, email, senha) {
  return await request("/cadastro", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  });
}

/* =========================
   DADOS GERAIS
========================= */

export async function getCampeonatos() {
  return await request("/campeonatos");
}

export async function getClassificacao() {
  return await request("/classificacao");
}

export async function getFinanceiro() {
  return await request("/financeiro");
}

export async function getJogos() {
  return await request("/jogos");
}

export async function getRanking() {
  return await request("/ranking");
}

export async function getRecordes() {
  return await request("/recordes");
}

export async function getTimes() {
  return await request("/times");
}