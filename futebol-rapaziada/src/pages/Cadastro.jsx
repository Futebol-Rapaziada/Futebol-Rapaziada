import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarJogador } from "../services/api";
import "../style/Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    posicao: "",
    time: "",
    idade: "",
    perna_boa: "Direita",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handle = (campo) => (e) => {
    setForm((prev) => ({
      ...prev,
      [campo]: e.target.value,
    }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const validarCampos = () => {
    if (!form.nome.trim()) return "Digite o nome.";
    if (!form.posicao.trim()) return "Digite a posição.";
    if (!form.time.trim()) return "Digite o time.";
    if (!form.idade) return "Digite a idade.";

    if (Number(form.idade) < 1 || Number(form.idade) > 60) {
      return "Idade inválida.";
    }

    return "";
  };

  const submit = async () => {
    setErro("");

    const erroValidacao = validarCampos();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const jogador = {
      nome: form.nome.trim(),
      posicao: form.posicao.trim(),
      time: form.time.trim(),
      idade: Number(form.idade),
      perna_boa: form.perna_boa,
      fotoUrl: preview,
      overall: 0,
      gols: 0,
      assistencias: 0,
      jogos: 0,
      cartoes: 0,
    };

    try {
      setLoading(true);

      await criarJogador(jogador);

      navigate("/home");
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar jogador.");
    } finally {
      setLoading(false);
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
          <input
            type="file"
            accept="image/*"
            onChange={handleFoto}
            style={{ display: "none" }}
          />

          <div
            className="foto-circle"
            style={
              preview
                ? {
                    backgroundImage: `url(${preview})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            {!preview && <span>📷</span>}
          </div>
        </label>

        <div className="form-grid">
          <input
            className="input"
            placeholder="Nome"
            value={form.nome}
            onChange={handle("nome")}
          />

          <input
            className="input"
            placeholder="Posição"
            value={form.posicao}
            onChange={handle("posicao")}
          />

          <input
            className="input"
            placeholder="Time"
            value={form.time}
            onChange={handle("time")}
          />

          <input
            className="input"
            type="number"
            placeholder="Idade"
            value={form.idade}
            onChange={handle("idade")}
          />

          <select
            className="input"
            value={form.perna_boa}
            onChange={handle("perna_boa")}
          >
            <option value="Direita">Direita</option>
            <option value="Esquerda">Esquerda</option>
            <option value="Ambas">Ambas</option>
          </select>
        </div>

        <p className="info-msg">
          Overall será definido apenas pela administração.
        </p>

        {erro && <p className="erro-msg">{erro}</p>}

        <button
          className="btn-primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar perfil →"}
        </button>
      </div>
    </div>
  );
}