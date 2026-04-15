const API_URL = "http://localhost:5000";

export async function getJogadores() {
  const response = await fetch(`${API_URL}/jogadores`);

  if (!response.ok) {
    throw new Error("Erro ao buscar jogadores");
  }

  return await response.json();
}

export async function criarJogador(data) {
  const response = await fetch(`${API_URL}/jogadores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar jogador");
  }

  return await response.json();
}

export async function deletarJogador(id) {
  const response = await fetch(`${API_URL}/jogadores/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar jogador");
  }

  return true;
}