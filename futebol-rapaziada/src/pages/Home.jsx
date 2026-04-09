import { usePlayer } from "../context/PlayerContext";
import "../style/Home.css";

export default function Home() {
  const { player } = usePlayer();

  // proteção caso entre direto na rota
  if (!player) {
    return (
      <div className="home-container">
        <h2>Nenhum jogador cadastrado</h2>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="player-card">
        <img
          src={player.image}
          alt="player"
          className="player-image"
        />

        <h1>{player.name}</h1>

        <p className="player-info">
          {player.position} • {player.strongFoot}
        </p>

        <div className="stats">
          <div className="stat">
            <span>⚽</span>
            <p>Goals</p>
            <h2>{player.goals}</h2>
          </div>

          <div className="stat">
            <span>🎯</span>
            <p>Assists</p>
            <h2>{player.assists}</h2>
          </div>

          <div className="stat">
            <span>🧤</span>
            <p>Saves</p>
            <h2>{player.saves}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}