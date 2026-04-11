import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "", posicao: "", idade: "", perna: "Direita", overall: "",
  });
  const [preview, setPreview] = useState(null);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!form.nome) return;
    localStorage.setItem("player", JSON.stringify({ ...form, fotoUrl: preview }));
    navigate("/home");
  };

  const overall = Number(form.overall);
  const cartaTipo = overall <= 33 ? "Bronze" : overall <= 66 ? "Prata" : "Ouro";
  const cartaCor  = overall <= 33 ? "#cd7f32" : overall <= 66 ? "#c0c0c0" : "#ffd700";

  return (
    <div className="cadastro-wrap">
      <div className="cadastro-card">

        <div className="cadastro-header">
          <span className="tagline">⚽ PLAYER CARD</span>
          <h1 className="cadastro-title">Cadastro do Jogador</h1>
          <p className="cadastro-sub">
            Preencha para criar seu perfil. As estatísticas começam em 0.
          </p>
        </div>

        {/* Foto */}
        <label className="foto-label">
          <input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
          <div
            className="foto-circle"
            style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
          >
            {!preview && <span className="foto-icon">📷</span>}
            {!preview && <span className="foto-hint">Adicionar foto</span>}
          </div>
        </label>

        {/* Campos */}
        <div className="form-grid">
          {[
            { key: "nome",    label: "Nome completo", placeholder: "Ex: Carlos Silva" },
            { key: "posicao", label: "Posição",        placeholder: "Ex: ATA" },
            { key: "idade",   label: "Idade",          placeholder: "Ex: 22" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="field-wrap">
              <label className="field-label">{label}</label>
              <input className="input" placeholder={placeholder} value={form[key]} onChange={handle(key)} />
            </div>
          ))}

          <div className="field-wrap">
            <label className="field-label">Perna boa</label>
            <select className="input" value={form.perna} onChange={handle("perna")}>
              <option value="Direita">Direita</option>
              <option value="Esquerda">Esquerda</option>
              <option value="Ambas">Ambas</option>
            </select>
          </div>
        </div>

        {/* Overall */}
        <div className="overall-wrap">
          <div className="overall-top">
            <span className="field-label">Overall</span>
            {form.overall && (
              <span className="overall-badge" style={{ background: cartaCor }}>
                Carta {cartaTipo}
              </span>
            )}
          </div>
          <input
            className="input overall-input"
            type="number"
            min={0} max={99}
            placeholder="Digite de 0 a 99"
            value={form.overall}
            onChange={handle("overall")}
            style={form.overall ? { borderColor: cartaCor, color: cartaCor } : {}}
          />
        </div>

        {/* Stats zeradas */}
        <div className="stats-preview-wrap">
          <span className="stats-preview-title">Estatísticas iniciais</span>
          <div className="stats-preview-row">
            {["Gols", "Assist.", "Jogos", "Cartões"].map((label) => (
              <div key={label} className="stat-chip">
                <span className="stat-num">0</span>
                <span className="stat-key">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={submit}>Criar perfil →</button>
      </div>
    </div>
  );
}