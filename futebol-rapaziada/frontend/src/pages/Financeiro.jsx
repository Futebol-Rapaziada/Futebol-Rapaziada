import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/financeiro.css";

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Valores fixos para exemplo (você pode trazer do banco depois)
  const VALOR_TITULAR = 18.00;
  const VALOR_RESERVA = 9.00;
  const CHAVE_PIX = "577-704-458-17";

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await getJogadores();
        setJogadores(dados);
      } catch (e) {
        console.error("Erro ao carregar financeiro:", e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const totalPagantes = jogadores.filter(j => j.pagou).length; // Supondo campo 'pagou' no banco

  return (
    <Layout>
      <div className="fin-page">
        <header className="fin-header">
          <h1 className="page-titulo">Controle Financeiro</h1>
          <p className="page-sub">Mensalidade Temporada 2026</p>
        </header>

        <div className="fin-grid-top">
          {/* Card de Informação de Pagamento */}
          <div className="fin-card pix-card">
            <div className="ic-header">
              <span>🔑</span>
              <h3>Chave PIX</h3>
            </div>
            <div className="ic-body">
              <p className="pix-chave">{CHAVE_PIX}</p>
              <p className="ic-sub">Titular: <span className="val-destaque">R$ {VALOR_TITULAR.toFixed(2)}</span></p>
              <p className="ic-sub">Reserva: <span className="val-destaque">R$ {VALOR_RESERVA.toFixed(2)}</span></p>
              <button className="btn-neon-mini" onClick={() => navigator.clipboard.writeText(CHAVE_PIX)}>
                Copiar Chave
              </button>
            </div>
          </div>

          {/* Card de Status Geral */}
          <div className="fin-card status-card">
            <div className="ic-header">
              <span>📊</span>
              <h3>Resumo</h3>
            </div>
            <div className="ic-body">
              <div className="desemp-row">
                <span className="d-lbl">Confirmados</span>
                <span className="d-val">{totalPagantes} / {jogadores.length}</span>
              </div>
              <div className="desemp-row">
                <span className="d-lbl">Total Arrecadado</span>
                <span className="d-val green">R$ {(totalPagantes * VALOR_MENSAL).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Jogadores */}
        <div className="fin-lista-container">
          <h2 className="lista-titulo-fin">Lista de Pagamentos</h2>
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
                  <tr key={jogador.id} className={jogador.pagou ? "row-pago" : "row-pendente"}>
                    <td>
                      <div className="user-cell">
                        <img src={jogador.fotoUrl || "👤"} alt="" />
                        <span>{jogador.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${jogador.pagou ? "pago" : "pendente"}`}>
                        {jogador.pagou ? "CONFIRMADO" : "PENDENTE"}
                      </span>
                    </td>
                    <td>R$ {VALOR_TITULAR.toFixed(2)} ou {VALOR_RESERVA.toFixed(2)}</td>
                    <td>
                      <button className="btn-status-toggle">
                        {jogador.pagou ? "Reverter" : "Confirmar"}
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