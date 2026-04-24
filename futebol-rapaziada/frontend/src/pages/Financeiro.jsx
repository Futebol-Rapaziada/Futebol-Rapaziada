import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/financeiro.css";

// URL da sua API no Railway
const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(null); // Para mostrar qual jogador está sendo atualizado
  
  const VALOR_TITULAR = 18.00;
  const VALOR_RESERVA = 9.00;
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

  // FUNÇÃO PARA CONFIRMAR / REVERTER PAGAMENTO
  async function toggleStatusPagamento(jogadorId, statusAtual) {
    setProcessando(jogadorId);
    try {
      const token = localStorage.getItem("token");
      
      // Faz a chamada para atualizar o campo 'pagou' no banco de dados
      const response = await fetch(`${API_URL}/jogadores/${jogadorId}`, {
        method: "PATCH", // Usamos PATCH para atualizar apenas um campo
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pagou: !statusAtual }) // Inverte o valor (se era false vira true)
      });

      if (response.ok) {
        // Se deu certo no banco, atualizamos a lista na tela sem precisar dar F5
        setJogadores(listaAtual => 
          listaAtual.map(j => j.id === jogadorId ? { ...j, pagou: !statusAtual } : j)
        );
      } else {
        alert("Erro ao atualizar o status no servidor.");
      }
    } catch (e) {
      console.error("Erro na requisição:", e);
      alert("Falha na conexão com o servidor.");
    } finally {
      setProcessando(null);
    }
  }

  const totalPagantes = jogadores.filter(j => j.pagou).length;

  if (loading) return <Layout><div className="loading">Carregando dados financeiros...</div></Layout>;

  return (
    <Layout>
      <div className="fin-page">
        <header className="fin-header">
          <h1 className="page-titulo">Controle Financeiro</h1>
          <p className="page-sub">Mensalidade Temporada 2026</p>
        </header>

        <div className="fin-grid-top">
          <div className="fin-card">
            <div className="ic-header">
              <span>🔑</span>
              <h3>Chave PIX</h3>
            </div>
            <div className="ic-body" style={{padding: '20px'}}>
              <p className="pix-chave">{CHAVE_PIX}</p>
              <button className="btn-neon-mini" onClick={() => {
                navigator.clipboard.writeText(CHAVE_PIX);
                alert("Chave PIX copiada!");
              }}>
                Copiar Chave
              </button>
            </div>
          </div>

          <div className="fin-card">
            <div className="ic-header">
              <span>📊</span>
              <h3>Resumo</h3>
            </div>
            <div className="ic-body" style={{padding: '20px'}}>
              <div className="desemp-row">
                <span className="d-lbl">Pagantes</span>
                <span className="d-val">{totalPagantes} / {jogadores.length}</span>
              </div>
              <div className="desemp-row">
                <span className="d-lbl">Total</span>
                <span className="d-val" style={{color: 'var(--neon)'}}>
                  R$ {(totalPagantes * VALOR_TITULAR).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="fin-lista-container">
          <h2 className="lista-titulo-fin">Lista de Pagamentos</h2>
          <div className="fin-tabela-wrapper">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {jogadores.map(jogador => (
                  <tr key={jogador.id} className={jogador.pagou ? "row-pago" : "row-pendente"}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{width: '32px', height: '32px'}}>
                          {jogador.nome?.[0]}
                        </div>
                        <span>{jogador.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${jogador.pagou ? "pago" : "pendente"}`}>
                        {jogador.pagou ? "CONFIRMADO" : "PENDENTE"}
                      </span>
                    </td>
                    <td>R$ {VALOR_TITULAR.toFixed(2)}</td>
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