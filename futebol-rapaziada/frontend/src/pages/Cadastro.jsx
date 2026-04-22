import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cadastro, criarJogador } from "../services/api";
import "../style/Cadastro.css";

const POSICOES = ["Goleiro","Zagueiro","Lateral Direito","Lateral Esquerdo","Meia","Centroavante"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function validarEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function validar(form) {
  const { nome, email, senha, confirmarSenha, posicao, idade } = form;
  if (!nome || !email || !senha || !confirmarSenha || !posicao || !idade)
    return "Preencha todos os campos obrigatórios.";
  if (!validarEmail(email)) return "Insira um e-mail válido.";
  if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  if (senha !== confirmarSenha) return "As senhas não coincidem.";
  const n = Number(idade);
  if (isNaN(n) || n < 5 || n > 99) return "Idade inválida (5 a 99).";
  return null;
}

// Converte arquivo para base64
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result); // retorna data:image/...;base64,...
    r.onerror = () => rej(new Error("Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "", email: "", senha: "", confirmarSenha: "",
    posicao: "", idade: "", perna_boa: "Direita",
  });

  const [fotoFile, setFotoFile]   = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState("");
  const [sucesso, setSucesso]     = useState("");

  const handle = campo => e => setForm(o => ({ ...o, [campo]: e.target.value }));

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) { setErro("A foto deve ter no máximo 2 MB."); return; }
    setErro("");
    setFotoFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function submit() {
    setErro(""); setSucesso("");
    const erroVal = validar(form);
    if (erroVal) { setErro(erroVal); return; }

    try {
      setLoading(true);

      // Converte foto para base64 se houver
      let fotoBase64 = "";
      if (fotoFile) {
        try {
          fotoBase64 = await fileToBase64(fotoFile);
        } catch {
          setErro("Erro ao processar a foto. Tente sem foto ou tente novamente.");
          return;
        }
      }

      // 1. Cria conta
      const dataUser = await cadastro(form.nome, form.email, form.senha);

      // 2. Salva user no localStorage
      if (dataUser?.id) {
        localStorage.setItem("user", JSON.stringify({
          id: dataUser.id, nome: form.nome, email: form.email,
        }));
      }

      // 3. Cria perfil do jogador
      try {
        await criarJogador({
          nome:         form.nome,
          posicao:      form.posicao,
          idade:        Number(form.idade),
          perna_boa:    form.perna_boa,
          fotoUrl:      fotoBase64, // base64 ou string vazia
          overall:      0,
          time:         "",
          gols:         0,
          assistencias: 0,
          jogos:        0,
          cartoes:      0,
        });
      } catch {
        setErro("Conta criada, mas erro ao salvar o perfil. Entre em contato com o suporte.");
        return;
      }

      setSucesso("Perfil criado com sucesso!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cad-wrap">
      <div className="cad-card">

        <div className="cad-header">
          <span className="cad-tagline">⚽ Player Card</span>
          <h1 className="cad-titulo">Cadastro do Jogador</h1>
          <p className="cad-sub">Crie sua conta e monte seu perfil.</p>
        </div>

        {/* Foto */}
        <label className="foto-label">
          <input type="file" accept="image/*" onChange={handleFoto} style={{ display:"none" }} />
          <div className="foto-circle" style={preview ? { backgroundImage:`url(${preview})`, backgroundSize:"cover", backgroundPosition:"center" } : {}}>
            {!preview && <span className="foto-icon">📷</span>}
            <span className="foto-hint">{preview ? "Trocar foto" : "Adicionar foto"}</span>
          </div>
        </label>
        <p className="foto-obs">Máx 2MB · JPG, PNG ou WebP</p>

        {/* Dados da conta */}
        <div className="form-section">
          <p className="section-label">Dados da Conta</p>
          <input className="input full" placeholder="Nome completo" value={form.nome} onChange={handle("nome")} />
          <input className="input full" placeholder="E-mail" type="email" value={form.email} onChange={handle("email")} />
          <div className="input-row">
            <input className="input" placeholder="Senha" type="password" value={form.senha} onChange={handle("senha")} />
            <input className="input" placeholder="Confirmar senha" type="password" value={form.confirmarSenha} onChange={handle("confirmarSenha")} />
          </div>
        </div>

        {/* Perfil do jogador */}
        <div className="form-section">
          <p className="section-label">Perfil do Jogador</p>
          <select className="input full" value={form.posicao} onChange={handle("posicao")}>
            <option value="">Selecione a posição</option>
            {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="input-row">
            <input className="input" placeholder="Idade" type="number" min="5" max="99" value={form.idade} onChange={handle("idade")} />
            <select className="input" value={form.perna_boa} onChange={handle("perna_boa")}>
              <option>Direita</option><option>Esquerda</option><option>Ambas</option>
            </select>
          </div>
        </div>

        <p className="overall-obs">Overall será definido apenas pela administração.</p>

        {erro   && <div className="msg erro">⚠ {erro}</div>}
        {sucesso && <div className="msg sucesso">✓ {sucesso}</div>}

        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Criando..." : "Criar perfil →"}
        </button>

        <p className="login-link">Já tem uma conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  );
}