export default function PlayerCard({ player }) {
  if (!player) return null;

  return (
    <div className="card">
      <img src={player.photo} alt="" />

      <h2>{player.name}</h2>

      <p>⚽ {player.goals}</p>
      <p>🎯 {player.assists}</p>
      <p>🧤 {player.defenses}</p>

      <h3>{player.points} pts</h3>
    </div>
  );
}