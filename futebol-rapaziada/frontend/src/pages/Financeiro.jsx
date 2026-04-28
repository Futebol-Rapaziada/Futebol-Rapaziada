import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores, obterToken } from "../services/api";
import "../style/financeiro.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [copiado, setCopiado] = useState(false);
  
  // Configuração de Valores
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

  const handleCopiar = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  async function toggleStatusPagamento(jogadorId, statusAtual) {
    setProcessando(jogadorId);
    try {
      const token = obterToken();
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessando(null);
    }
  }

  // CÁLCULO DO TOTAL ARRECADADO
  // Aqui ele soma 18 se for titular e 9 se for reserva (ajuste a lógica de 'isReserva' conforme seu banco)
  const totalArrecadado = jogadores
    .filter(j => j.pagou)
    .reduce((acc, j) => acc + (j.isReserva ? VALOR_RESERVA : VALOR_TITULAR), 0);

  if (loading) return <Layout><div className="loading">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="fin-page">
        <header className="fin-header">
          <h1 className="info-nome">Financeiro</h1>
          <p className="tag">Temporada 2026</p>
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
              <div className="valores-info">
                <span className="val-item">Titular: <b>R$ {VALOR_TITULAR.toFixed(2)}</b></span>
                <span className="val-item">Reserva: <b>R$ {VALOR_RESERVA.toFixed(2)}</b></span>
              </div>
              <button 
                className={`btn-copiar-pix ${copiado ? 'sucesso' : ''}`} 
                onClick={handleCopiar}
              >
                <span className="pix-icon">{copiado ? '✅' : '📋'}</span>
                {copiado ? 'Copiado!' : 'Copiar Chave'}
              </button>
            </div>
          </div>

          {/* Card Resumo */}
          <div className="fin-card">
            <div className="ic-header">
              <span>📊</span>
              <h3>Balanço Atual</h3>
            </div>
            <div className="ic-body" style={{ padding: '20px' }}>
              <div className="desemp-row">
                <span className="d-lbl">Total Arrecadado</span>
                <span className="d-val green">R$ {totalArrecadado.toFixed(2)}</span>
              </div>
              <p className="obs-fin">* Soma de titulares e reservas pagos.</p>
            </div>
          </div>
        </div>

        <div className="info-card" style={{ marginTop: '20px' }}>
          <div className="ic-header"><h3>Lista de Pagamentos</h3></div>
          <div className="fin-tabela-wrapper">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {jogadores.map(jogador => {
                  const valorCobrado = jogador.isReserva ? VALOR_RESERVA : VALOR_TITULAR;
                  return (
                    <tr key={jogador.id_jogador}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar" style={{width:'30px', height:'30px'}}>
                            {jogador.nome?.[0]}
                          </div>
                          <span>{jogador.nome}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-tipo ${jogador.isReserva ? 'res' : 'tit'}`}>
                          {jogador.isReserva ? 'RESERVA' : 'TITULAR'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${jogador.pagou ? "pago" : "pendente"}`}>
                          {jogador.pagou ? "PAGO" : "PENDENTE"}
                        </span>
                      </td>
                      <td className="valor-celula">R$ {valorCobrado.toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn-status-toggle"
                          disabled={processando === jogador.id_jogador}
                          onClick={() => toggleStatusPagamento(jogador.id_jogador, jogador.pagou)}
                        >
                          {processando === jogador.id_jogador ? "..." : (jogador.pagou ? "Reverter" : "Confirmar")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}