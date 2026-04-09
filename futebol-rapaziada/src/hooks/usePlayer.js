import { useEffect, useState } from "react";
import { getMe } from "../services/playerService";

export function usePlayer() {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await getMe();
      setPlayer(res.data);
    }

    load();
  }, []);

  return { player };
}