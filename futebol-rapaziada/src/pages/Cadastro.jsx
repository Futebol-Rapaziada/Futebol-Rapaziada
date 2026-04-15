import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarJogador } from "../services/api";
import "../style/Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    posicao: "",
    idade: "",
    perna: "Direita",
    overall: "",
  });

  const [preview, setPreview] = useState(null);

  const handle = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.nome) return;

    const jogador = {
      ...form,
      fotoUrl: preview,
      gols: 0,
      assistencias: 0,
      jogos: 0,
      cartoes: 0,
    };

    try {
      const data = await criarJogador(jogador);

      // 🔥 LOGIN AUTOMÁTICO
      localStorage.setItem("user", JSON.stringify(data));

      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="cadastro-wrap">
      <div className="cadastro-card">

        <div className="cadastro-header">
          <span className="tagline">⚽ PLAYER CARD</span>
          <h1 className="cadastro-title">Cadastro do Jogador</h1>
        </div>

        <label className="foto-label">
          <input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
          <div
            className="foto-circle"
            style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: "cover" } : {}}
          >
            {!preview && <span>📷</span>}
          </div>
        </label>

        <div className="form-grid">
          <input className="input" placeholder="Nome" value={form.nome} onChange={handle("nome")} />
          <input className="input" placeholder="Posição" value={form.posicao} onChange={handle("posicao")} />
          <input className="input" placeholder="Idade" value={form.idade} onChange={handle("idade")} />

          <select className="input" value={form.perna} onChange={handle("perna")}>
            <option>Direita</option>
            <option>Esquerda</option>
            <option>Ambas</option>
          </select>
        </div>

        <button className="btn-primary" onClick={submit}>
          Criar perfil →
        </button>

      </div>
    </div>
  );
}