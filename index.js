const { writeFileSync } = require("node:fs");

class EternalReturn {

  #_baseURL = "https://bser-rest-release.bser.io/api";
  #_endpoint = "external/findReplayGame"
  #_gameVersion = "1.15.0";
  #_replayVersion = "1.15.0";

  constructor(token) {
    this._token = token.replace("Session:", "");
    this._headers = {
      method: "GET",
      headers: {
        "X-BSER-SessionKey": `Session:${this._token}`,
        "X-BSER-Version": this.#_gameVersion,
        "X-BSER-Replay-Version": this.#_replayVersion,
        "Content-Type": "application/json"
      }
    }
  }

  async getReplay(gameId, userId = 225296) {
    try {
      if (!gameId.trim()) throw new Exceptions(0);

      const response = await fetch(`${this.#_baseURL}/${this.#_endpoint}/${gameId}/${userId}`, this._headers);
      const data = await response.json();

      if (data.cod !== 200) throw new Exceptions(data.cod);

      await this.#downloadReplay(data.rst.replayPath, gameId);
    } catch (e) {
      console.error(e)
    }
  }

  async #downloadReplay(url, gameId) {
    const format = url.split(".").pop();
    const response = await fetch(url);
    const replay = await response.text();
    writeFileSync(`./EternalReturn-${gameId}.${format}`, replay);
  }
}

class Exceptions extends Error {

  static errors = {
    0: "Missing gameId",
    1001: "Parameter type mismatch",
    1102: "Invalid Token",
    1201: "Not exist this gameId",
    9300: "Invalid ID Replay version"
  }

  constructor(cod) {
    super()
    this.name = "Eternal Return Exeception"
    this.message = Exceptions.errors[cod]
  }
}

(async () => {
  const er = new EternalReturn("Session:<token>");
  await er.getReplay("<gameId>");
})();
