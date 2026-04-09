import { playerMock } from "../mocks/playeMock.js";

export async function getPlayer() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(playerMock);
    }, 800);
  });
}