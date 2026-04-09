import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import PlayerAvatar from "../components/Player/PlayerAvatar";
import "../style/Cadastro.css";

export default function Cadastro() {
  const { setPlayer } = usePlayer();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    position: "",
    strongFoot: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    setPlayer({
      ...form,
      image,
      goals: 0,
      assists: 0,
      saves: 0,
    });

    navigate("/home");
  }

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>⚽ FUT APP</h1>

        <PlayerAvatar image={image} setImage={setImage} />

        <input
          name="name"
          placeholder="Nome"
          onChange={handleChange}
          required
        />

        <input
          name="age"
          placeholder="Idade"
          type="number"
          onChange={handleChange}
          required
        />

        <input
          name="position"
          placeholder="Posição (ex: Meia, Lateral)"
          onChange={handleChange}
        />

        <select name="strongFoot" onChange={handleChange}>
          <option>Perna boa</option>
          <option>Direita</option>
          <option>Esquerda</option>
          <option>Ambas</option>
        </select>

        <button type="submit">
          Entrar no Campeonato
        </button>
      </form>
    </div>
  );
}