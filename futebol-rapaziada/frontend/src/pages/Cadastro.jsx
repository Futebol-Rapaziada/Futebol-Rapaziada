import { Link, useNavigate } from "react-router-dom";
import { cadastro, criarJogador } from "../services/api";
import "../style/Cadastro.css";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────────

const POSICOES = [
  "Goleiro",
  "Zagueiro",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Meia",
  "Centroavante",
];

const TAMANHO_MAX_FOTO = 2 * 1024 * 1024; // 2 MB

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────────

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarForm(form) {
  const { nome, email, senha, confirmarSenha, posicao, idade } = form;

  if (!nome || !email || !senha || !confirmarSenha || !posicao || !idade) {
    return "Preencha todos os campos obrigatórios.";
  }
  if (!validarEmail(email)) {
    return "Insira um e-mail válido.";
  }
  if (senha.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (senha !== confirmarSenha) {
    return "As senhas não coincidem.";
  }
  const idadeNum = Number(idade);
  if (isNaN(idadeNum) || idadeNum < 5 || idadeNum > 99) {
    return "Insira uma idade válida (entre 5 e 99).";
  }

  return null; // sem erros
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────────

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    posicao: "",
    idade: "",
    perna_boa: "Direita",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handle = (campo) => (e) =>
    setForm((old) => ({ ...old, [campo]: e.target.value }));

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > TAMANHO_MAX_FOTO) {
      setErro("A foto deve ter no máximo 2 MB.");
      return;
    }

    setErro("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setErro("");
    setSucesso("");

    const erroValidacao = validarForm(form);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setLoading(true);

      // Passo 1: cria a conta do usuário
      await cadastro(form.nome, form.email, form.senha);

      // Passo 2: cria o perfil do jogador
      // Em um try separado para dar uma mensagem de erro específica
      // caso o usuário seja criado mas o jogador não
      try {
        await criarJogador({
          nome: form.nome,
          posicao: form.posicao,
          idade: Number(form.idade),
          perna_boa: form.perna_boa,
          fotoUrl: preview ?? "",
          overall: 0,
          time: "",
          gols: 0,
          assistencias: 0,
          jogos: 0,
          cartoes: 0,
        });
      } catch {
        setErro(
          "Conta criada, mas houve um erro ao salvar o perfil do jogador. Entre em contato com o suporte."
        );
        return;
      }

      setSucesso("Perfil criado com sucesso!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-wrap">
      <div className="cadastro-card">

        {/* Cabeçalho */}
        <div className="cadastro-header">
          <span className="tagline">⚽ Player Card</span>
          <h1 className="cadastro-title">Cadastro do Jogador</h1>
          <p className="cadastro-sub">Crie sua conta e monte seu perfil.</p>
        </div>

        {/* Upload de foto */}
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
            <span className="foto-hint">
              {preview ? "Trocar foto" : "Adicionar foto"}
            </span>
          </div>
        </label>

        {/* Seção: Dados da Conta */}
        <div className="form-section">
          <p className="section-label">Dados da Conta</p>
          <div className="form-grid">
            <input
              className="input full"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handle("nome")}
            />
            <input
              className="input full"
              placeholder="E-mail"
              type="email"
              value={form.email}
              onChange={handle("email")}
            />
            <input
              className="input"
              placeholder="Senha"
              type="password"
              value={form.senha}
              onChange={handle("senha")}
            />
            <input
              className="input"
              placeholder="Confirmar senha"
              type="password"
              value={form.confirmarSenha}
              onChange={handle("confirmarSenha")}
            />
          </div>
        </div>

        {/* Seção: Perfil do Jogador */}
        <div className="form-section">
          <p className="section-label">Perfil do Jogador</p>
          <div className="form-grid">
            <select
              className="input full"
              value={form.posicao}
              onChange={handle("posicao")}
            >
              <option value="">Selecione a posição</option>
              {POSICOES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Idade"
              type="number"
              min="5"
              max="99"
              value={form.idade}
              onChange={handle("idade")}
            />
            <select
              className="input"
              value={form.perna_boa}
              onChange={handle("perna_boa")}
            >
              <option>Direita</option>
              <option>Esquerda</option>
              <option>Ambas</option>
            </select>
          </div>
        </div>

        <p className="info-msg">Overall será definido apenas pela administração.</p>

        {/* Mensagens de feedback */}
        {erro   && <div className="msg erro">⚠ {erro}</div>}
        {sucesso && <div className="msg sucesso">✓ {sucesso}</div>}

        <button
          className="btn-primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar perfil →"}
        </button>

        <p className="login-link">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>

      </div>
    </div>
  )}