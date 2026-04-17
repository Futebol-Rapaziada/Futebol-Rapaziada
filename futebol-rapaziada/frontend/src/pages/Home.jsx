import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJogadores, deletarJogador } from "../services/api";
import "../style/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  const player = usuarios[playerIndex] || {};

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/");
      return;
    }

    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const data = await getJogadores();
      setUsuarios(data);

      // 🔥 posicionar no usuário logado
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        const index = data.findIndex((u) => u.id === user.id);
        if (index !== -1) setPlayerIndex(index);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function proximoPlayer() {
    setPlayerIndex((prev) => (prev + 1) % usuarios.length);
  }

  function anteriorPlayer() {
    setPlayerIndex((prev) =>
      prev === 0 ? usuarios.length - 1 : prev - 1
    );
  }

  async function handleDelete() {
    if (!player.id) return;

    await deletarJogador(player.id);

    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.id === player.id) {
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    carregarUsuarios();
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="home-wrap">

      <div className="top-bar">
        <span>PLAYER CARD</span>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
        >
          Sair
        </button>
      </div>

      <div className="carta">
        <div>{player.nome}</div>
        <div>{player.posicao}</div>

        <div>
          ⚽ {player.gols || 0} | 🎯 {player.assistencias || 0}
        </div>
      </div>

      <div>
        <button onClick={anteriorPlayer}>⬅️</button>
        <button onClick={proximoPlayer}>➡️</button>
      </div>

      <button onClick={handleDelete}>Deletar jogador</button>

    </div>
  );
}