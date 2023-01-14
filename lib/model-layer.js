const { v4: uuidv4 } = require("uuid");

class ModelLayer {
  constructor({ db, hashSecret }) {
    this.db = db;
    this.hashSecret = hashSecret;

    if (this.hashSecret === null) {
      throw Error("Hash secret cannot be empty");
    }
  }

  async createPortal({hostPeerId}) {
    const id = uuidv4();
    const command = this.db`
      INSERT INTO portals (id, host_peer_id)
      VALUES (${id}, ${hostPeerId})
      RETURNING *;
    `;

    if (command.count === 0) {
      // Not sure what the best method to error here is
    }

    return id;
  }

  async findPortal(id) {
    try {

      const result = await this.db`
        SELECT * FROM portals
        WHERE id = ${id}
      `;

      if (result.count === 0) {
        return null;
      }

      return {
        hostPeerId: result[0].host_peer_id
      };

    } catch(e) {
      const malformedUUIDErrorCode = "22P02";
      if (e.code === malformedUUIDErrorCode) {
        return null;
      }
    }
  }

  async createEvent(event) {
    try {

      const { name, identity, portalId } = event;
      const loginHash = "HASH"; // TODO Create hash
      const command = this.db`
        INSERT INTO events (name, user_id, portal_id, created_at)
        VALUES (${name}, ${loginHash}, ${portalId}, ${Date.now()})
      `;
      // Then we return empty
      return;
    } catch(err) {
      console.error(err);
    }
  }

  async getEvents() {
    const command = this.db`
      SELECT * FROM events
      ORDER BY created_at ASC
    `;

    if (command.count === 0) {
      // TODO
    }

    return command[0];
  }

  async isOperational() {
    // TODO
    return true;
  }
}

module.exports = ModelLayer;
