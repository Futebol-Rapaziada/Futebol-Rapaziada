const API_URL = "http://localhost:5000";

export async function getUsuarios() {
  const response = await fetch(`${API_URL}/usuarios`);
  return response.json();
}

export async function criarUsuario(data) {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function deletarUsuario(id) {
  await fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE",
  });
}