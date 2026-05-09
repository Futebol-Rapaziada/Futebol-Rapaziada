import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getJogadores, obterToken, getUsuarioAtual } from "../services/api";
import "../style/financeiro.css";

const API_URL = import.meta.env.VITE_API_URL ?? "https://futebol-rapaziada-production.up.railway.app";

export default function Financeiro() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  // Valores editáveis pelo admin
  const [valores, setValores] = useState({ titular: 17.25, reserva: 8.63});
  const [valoresTemp, setValoresTemp] = useState({ titular:17.25, reserva: 8.63 });
  const [editandoValores, setEditandoValores] = useState(false);
  const [salvandoValores, setSalvandoValores] = useState(false);

  const CHAVE_PIX = "577-704-458-17";

  useEffect(() => {
    carregarDados();
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    try {
      // Adapte conforme seu serviço — getUsuarioAtual() deve retornar { id_jogador, isAdmin, ... }
      const usuario = await getUsuarioAtual();
      setUsuarioAtual(usuario);
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
    }
  }

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

  // ✅ Só o próprio jogador ou o admin podem alterar pagamento
  const podeAlterarPagamento = (jogadorId) => {
    if (!usuarioAtual) return false;
    return usuarioAtual.isAdmin || usuarioAtual.id_jogador === jogadorId;
  };

  const isAdmin = usuarioAtual?.isAdmin === true;

  const handleCopiar = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  async function toggleStatusPagamento(jogadorId, statusAtual) {
    setProcessando(jogadorId);
    try {
      const token = obterToken();
      const response = await fetch(`${API_URL}/jogadores/${jogadorId}/pagamento`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pagou: !statusAtual })
      });

      if (response.ok) {
        setJogadores(lista =>
          lista.map(j => j.id_jogador === jogadorId ? { ...j, pagou: !statusAtual } : j)
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessando(null);
    }
  }

  // ✅ Admin salva novos valores de titular/reserva via API
  async function salvarValores() {
    setSalvandoValores(true);
    try {
      const token = obterToken();
      const response = await fetch(`${API_URL}/configuracoes/valores`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          valor_titular: parseFloat(valoresTemp.titular),
          valor_reserva: parseFloat(valoresTemp.reserva)
        })
      });

      if (response.ok) {
        setValores({ ...valoresTemp });
        setEditandoValores(false);
      } else {
        alert("Erro ao salvar valores. Tente novamente.");
      }
    } catch (e) {
      console.error("Erro ao salvar valores:", e);
      alert("Erro de conexão ao salvar valores.");
    } finally {
      setSalvandoValores(false);
    }
  }

  function cancelarEdicaoValores() {
    setValoresTemp({ ...valores });
    setEditandoValores(false);
  }

  const totalArrecadado = jogadores
    .filter(j => j.pagou)
    .reduce((acc, j) => acc + (j.isReserva ? valores.reserva : valores.titular), 0);

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
              {/* ✅ Botão de edição visível somente para o admin */}
              {isAdmin && (
                <button
                  className="btn-editar-valores"
                  onClick={() => {
                    setValoresTemp({ ...valores });
                    setEditandoValores(true);
                  }}
                  title="Editar valores"
                >
                  ✏️ Editar Valores
                </button>
              )}
            </div>
            <div className="ic-body" style={{ padding: '20px' }}>
              <p className="pix-chave">{CHAVE_PIX}</p>

              {/* ✅ Modo edição de valores (somente admin) */}
              {isAdmin && editandoValores ? (
                <div className="form-editar-valores">
                  <label>
                    Titular (R$)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valoresTemp.titular}
                      onChange={e => setValoresTemp(v => ({ ...v, titular: e.target.value }))}
                    />
                  </label>
                  <label>
                    Reserva (R$)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valoresTemp.reserva}
                      onChange={e => setValoresTemp(v => ({ ...v, reserva: e.target.value }))}
                    />
                  </label>
                  <div className="form-editar-acoes">
                    <button
                      className="btn-salvar-valores"
                      onClick={salvarValores}
                      disabled={salvandoValores}
                    >
                      {salvandoValores ? "Salvando..." : "✅ Salvar"}
                    </button>
                    <button
                      className="btn-cancelar-valores"
                      onClick={cancelarEdicaoValores}
                      disabled={salvandoValores}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="valores-info">
                  <span className="val-item">Titular: <b>R$ {Number(valores.titular).toFixed(2)}</b></span>
                  <span className="val-item">Reserva: <b>R$ {Number(valores.reserva).toFixed(2)}</b></span>
                </div>
              )}

              <button
                className={`btn-copiar-pix ${copiado ? 'sucesso' : ''}`}
                onClick={handleCopiar}
              >
                <span className="pix-icon">{copiado ? '✅' : '📋'}</span>
                {copiado ? 'Copiado!' : 'Copiar Chave'}
              </button>
            </div>
          </div>

          {/* Card Balanço */}
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

        {/* Tabela de pagamentos */}
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
                  const valorCobrado = jogador.isReserva ? valores.reserva : valores.titular;
                  const temPermissao = podeAlterarPagamento(jogador.id_jogador);

                  return (
                    <tr key={jogador.id_jogador}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar" style={{ width: '30px', height: '30px' }}>
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
                      <td className="valor-celula">R$ {Number(valorCobrado).toFixed(2)}</td>
                      <td>
                        {/* ✅ Botão visível somente para o próprio jogador ou admin */}
                        {temPermissao ? (
                          <button
                            className="btn-status-toggle"
                            disabled={processando === jogador.id_jogador}
                            onClick={() => toggleStatusPagamento(jogador.id_jogador, jogador.pagou)}
                          >
                            {processando === jogador.id_jogador
                              ? "..."
                              : jogador.pagou ? "Reverter" : "Confirmar"}
                          </button>
                        ) : (
                          <span className="sem-permissao">—</span>
                        )}
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