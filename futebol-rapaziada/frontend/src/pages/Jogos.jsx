import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../style/Jogos.css";

export default function Jogos() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!usuarioLogado) navigate("/login");
  }, []);

  // Dados mockados por enquanto
  const jogos = [];

  return (
    <Layout>
      <div className="jogos-wrap">
        <h1 className="page-titulo">Jogos</h1>
        <p className="page-sub">Histórico e próximos jogos da temporada 2026</p>

        {jogos.length === 0 ? (
          <div className="jogos-empty">
            <span className="je-icone">⚽</span>
            <h2>Nenhum jogo cadastrado ainda</h2>
            <p>Os jogos serão adicionados conforme a temporada avançar.</p>
            <div className="camp-aviso" style={{marginTop:20}}>
              🚧 Em breve: registro de jogos com placar, artilheiros e assistências automáticas.
            </div>
          </div>
        ) : (
          <div className="jogos-lista">
            {jogos.map((j, i) => (
              <div key={i} className="jogo-card">
                <p>{j.data}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
