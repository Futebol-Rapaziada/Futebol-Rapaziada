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

  if (data?.token) salvarToken(data.token);

  // Salva os dados do usuário para o Home.jsx usar
  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

export async function cadastro(nome, email, senha) {
  const data = await request("/cadastro", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  });

  // Salva o user no localStorage para o Home.jsx usar
  if (data?.id) {
    localStorage.setItem("user", JSON.stringify({ id: data.id, nome, email }));
  }

  return data;
}

/* =========================
   DADOS GERAIS
========================= */
// ─── Adicionar no final do seu api.js ────────────────────────────────────────
// Cole essas funções no arquivo frontend/src/services/api.js

/* =========================
   MÍDIAS
========================= */

// Listar vídeos — params: { tag, busca, ordem, pagina }
export async function getMidias(params = {}) {
  const query = new URLSearchParams();
  if (params.tag && params.tag !== "Todos") query.set("tag", params.tag);
  if (params.busca)  query.set("busca",  params.busca);
  if (params.ordem)  query.set("ordem",  params.ordem);
  if (params.pagina) query.set("pagina", params.pagina);

  const qs = query.toString();
  return request(`/midias${qs ? "?" + qs : ""}`);
}

// Detalhe de um vídeo (já incrementa view no back)
export async function getMidia(id) {
  return request(`/midias/${id}`);
}

// Upload de vídeo — usa fetch direto (multipart/form-data, sem Content-Type JSON)
export async function postMidia(form) {
  const fd = new FormData();
  fd.append("titulo",    form.titulo);
  fd.append("descricao", form.descricao || "");
  fd.append("tag",       form.tag);
  fd.append("video",     form.arquivo); // File vindo do <input type="file">

  const token = obterToken();

  const response = await fetch(`${API_URL}/midias`, {
    method: "POST",
    headers: {
      // SEM Content-Type aqui — o browser define automaticamente com o boundary do multipart
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: fd,
  });

  let data = null;
  try { data = await response.json(); } catch { data = null; }

  if (!response.ok) {
    throw new Error(data?.erro || data?.mensagem || "Erro ao fazer upload");
  }

  return data; // { id, titulo, video_url, mensagem }
}

// Curtir / Descurtir (toggle — back decide se adiciona ou remove)
export async function curtirMidia(id) {
  return request(`/midias/${id}/curtir`, { method: "POST" });
  // Retorna: { curtido: bool, total_curtidas: number }
}

// Deletar vídeo (só o dono ou admin)
export async function deleteMidia(id) {
  return request(`/midias/${id}`, { method: "DELETE" });
}

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