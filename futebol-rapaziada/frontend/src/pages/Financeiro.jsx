import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/financeiro.css"; // Certifique-se que o nome do arquivo é minúsculo se o arquivo for 'financeiro.css'

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const totalPagantes = jogadores.filter(j => j.pagou).length;

  return (
    <Layout>
      <div className="fin-page">
        <header className="fin-header">
          <h1 className="info-nome">Controle Financeiro</h1>
          <p className="tag">Temporada 2026</p>
        </header>

        <div className="fin-grid-top">
          {/* Card PIX */}
          <div className="fin-card">
            <div className="ic-header">
              <span>🔑</span>
              <h3>Chave PIX</h3>
            </div>
            <div className="ic-body">
              <p className="pix-chave">{CHAVE_PIX}</p>
              <div className="desemp-mini">
                 <div className="desemp-row">
                    <span className="d-lbl">Titular</span>
                    <span className="d-val">R$ {VALOR_TITULAR.toFixed(2)}</span>
                 </div>
                 <div className="desemp-row">
                    <span className="d-lbl">Reserva</span>
                    <span className="d-val">R$ {VALOR_RESERVA.toFixed(2)}</span>
                 </div>
              </div>
              <button className="btn-neon" style={{marginTop: '15px', padding: '8px'}} onClick={() => navigator.clipboard.writeText(CHAVE_PIX)}>
                Copiar Chave
              </button>
            </div>
          </div>

          {/* Card Resumo */}
          <div className="fin-card">
            <div className="ic-header">
              <span>📊</span>
              <h3>Resumo Geral</h3>
            </div>
            <div className="ic-body">
              <div className="desemp-mini">
                <div className="desemp-row">
                  <span className="d-lbl">Confirmados</span>
                  <span className="d-val">{totalPagantes} / {jogadores.length}</span>
                </div>
                <div className="desemp-row">
                  <span className="d-lbl">Arrecadado Est.</span>
                  <span className="d-val" style={{color: 'var(--neon)'}}>R$ {(totalPagantes * VALOR_TITULAR).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="info-card" style={{marginTop: '20px'}}>
          <div className="ic-header">
            <h3>Lista de Pagamentos</h3>
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
                        <div className="user-avatar" style={{width: '30px', height: '30px', fontSize: '12px'}}>
                          {jogador.fotoUrl ? <img src={jogador.fotoUrl} alt="" /> : jogador.nome?.[0]}
                        </div>
                        <span style={{color: 'var(--text)'}}>{jogador.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${jogador.pagou ? "pago" : "pendente"}`}>
                        {jogador.pagou ? "CONFIRMADO" : "PENDENTE"}
                      </span>
                    </td>
                    <td style={{color: 'var(--text2)', fontSize: '13px'}}>R$ {VALOR_TITULAR.toFixed(2)}</td>
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