import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/financeiro.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [copiado, setCopiado] = useState(false);
  
  const VALOR_TITULAR = 18.00;
  const CHAVE_PIX = "577-704-458-17";

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const dados = await getJogadores();
      setJogadores(dados);
    } catch (e) {
      console.error("Erro ao carregar financeiro:", e);
    } finally {
      setLoading(false);
    }
  }

  // Função para Copiar PIX
  const handleCopiar = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Função para Confirmar/Reverter Pagamento no Banco de Dados
  async function toggleStatusPagamento(jogadorId, statusAtual) {
    setProcessando(jogadorId);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/jogadores/${jogadorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pagou: !statusAtual })
      });

      if (response.ok) {
        setJogadores(lista => 
          lista.map(j => j.id === jogadorId ? { ...j, pagou: !statusAtual } : j)
        );
      } else {
        alert("Erro ao atualizar no servidor. Verifique o login.");
      }
    } catch (e) {
      console.error(e);
      alert("Falha na conexão.");
    } finally {
      setProcessando(null);
    }
  }

  const totalPagantes = jogadores.filter(j => j.pagou).length;

  if (loading) return <Layout><div className="loading">Carregando dados...</div></Layout>;

  return (
    <Layout>
      <div className="fin-page">
        <header className="fin-header">
          <div className="header-info">
            <h1 className="info-nome">Controle Financeiro</h1>
            <p className="tag">Temporada 2026</p>
          </div>
        </header>

        <div className="fin-grid-top">
          {/* Card PIX */}
          <div className="fin-card">
            <div className="ic-header">
              <span>🔑</span>
              <h3>Pagamento PIX</h3>
            </div>
            <div className="ic-body" style={{ padding: '20px' }}>
              <p className="pix-chave">{CHAVE_PIX}</p>
              <button 
                className={`btn-copiar-pix ${copiado ? 'sucesso' : ''}`} 
                onClick={handleCopiar}
              >
                <span className="pix-icon">{copiado ? '✅' : '📋'}</span>
                {copiado ? 'Copiado!' : 'Copiar Chave PIX'}
              </button>
            </div>
          </div>

          {/* Card Resumo */}
          <div className="fin-card">
            <div className="ic-header">
              <span>📊</span>
              <h3>Balanço Mensal</h3>
            </div>
            <div className="ic-body" style={{ padding: '20px' }}>
              <div className="desemp-mini">
                <div className="desemp-row">
                  <span className="d-lbl">Confirmados</span>
                  <span className="d-val">{totalPagantes} / {jogadores.length}</span>
                </div>
                <div className="desemp-row">
                  <span className="d-lbl">Total em Caixa</span>
                  <span className="d-val" style={{ color: 'var(--neon)' }}>
                    R$ {(totalPagantes * VALOR_TITULAR).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Jogadores */}
        <div className="info-card" style={{ marginTop: '20px' }}>
          <div className="ic-header">
            <h3>Lista de Mensalidades</h3>
          </div>
          <div className="fin-tabela-wrapper">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {jogadores.map(jogador => (
                  <tr key={jogador.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {jogador.fotoUrl ? <img src={jogador.fotoUrl} alt="" /> : jogador.nome?.[0]}
                        </div>
                        <span style={{ color: 'var(--text)' }}>{jogador.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${jogador.pagou ? "pago" : "pendente"}`}>
                        {jogador.pagou ? "CONFIRMADO" : "PENDENTE"}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '13px' }}>R$ {VALOR_TITULAR.toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn-status-toggle"
                        disabled={processando === jogador.id}
                        onClick={() => toggleStatusPagamento(jogador.id, jogador.pagou)}
                      >
                        {processando === jogador.id ? "..." : (jogador.pagou ? "Reverter" : "Confirmar")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}