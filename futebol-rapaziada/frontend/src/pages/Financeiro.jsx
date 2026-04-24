import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores } from "../services/api";
import "../style/financeiro.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const VALOR_TITULAR = 18.00;
  const CHAVE_PIX = "577-704-458-17";

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const dados = await getJogadores();
      setJogadores(dados);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // NOVA FUNÇÃO: Faz o botão funcionar
  async function togglePagamento(id, statusAtual) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/jogadores/${id}`, {
        method: "PATCH", // Ou PUT, dependendo da sua API
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pagou: !statusAtual }) // Inverte o status
      });

      if (response.ok) {
        // Atualiza a lista localmente para o utilizador ver a mudança na hora
        setJogadores(prev => prev.map(j => 
          j.id === id ? { ...j, pagou: !statusAtual } : j
        ));
      } else {
        alert("Erro ao atualizar status. Verifica as permissões.");
      }
    } catch (e) {
      console.error("Erro ao salvar pagamento:", e);
    }
  }

  return (
    <Layout>
      <div className="fin-page">
        {/* ... (resto do cabeçalho igual) */}
        
        <div className="info-card">
          <table className="fin-table">
            {/* ... (thead igual) */}
            <tbody>
              {jogadores.map(jogador => (
                <tr key={jogador.id}>
                  <td>{jogador.nome}</td>
                  <td>
                    <span className={`status-badge ${jogador.pagou ? "pago" : "pendente"}`}>
                      {jogador.pagou ? "CONFIRMADO" : "PENDENTE"}
                    </span>
                  </td>
                  <td>R$ {VALOR_TITULAR.toFixed(2)}</td>
                  <td>
                    {/* BOTÃO CORRIGIDO AQUI */}
                    <button 
                      className="btn-status-toggle"
                      onClick={() => togglePagamento(jogador.id, jogador.pagou)}
                    >
                      {jogador.pagou ? "Reverter" : "Confirmar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}