const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app"

// ─── TOKEN ───────────────────────────────────────────────────────────────────────

export function salvarToken(token) {
  localStorage.setItem("token", token);
}

export function obterToken() {
  return localStorage.getItem("token");
}

export function removerToken() {
  localStorage.removeItem("token");
}

// ─── REQUEST BASE ─────────────────────────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const token = obterToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  return request("/jogadores");
}

export async function criarJogador(jogador) {
  return request("/jogadores", {
    method: "POST",
    body: JSON.stringify(jogador),
  });
}

export async function deletarJogador(id) {
  return request(`/jogadores/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   LOGIN / CADASTRO
========================= */

export async function login(email, senha) {
  const data = await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
  // Salva o token automaticamente após login bem-sucedido
  if (data?.token) salvarToken(data.token);
  return data;
}

export async function cadastro(nome, email, senha) {
  return request("/cadastro", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  });
}

/* =========================
   DADOS GERAIS
========================= */

export async function getCampeonatos() {
  return request("/campeonatos");
}

export async function getClassificacao() {
  return request("/classificacao");
}

export async function getFinanceiro() {
  return request("/financeiro");
}

export async function getJogos() {
  return request("/jogos");
}

export async function getRanking() {
  return request("/ranking");
}

export async function getRecordes() {
  return request("/recordes");
}

export async function getTimes() {
  return request("/times");
}