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
    const command = await this.db`
      INSERT INTO portals (id, host_peer_id)
      VALUES (${id}, ${hostPeerId})
      RETURNING *;
    `;

    if (command.count === 0) {
      // Not sure what the best method to error here is
    }
    console.log("model-layer.createPortal() Output Below: ");
    console.log(command);
    console.log(`model-layer.createPortal(): Returning: ${id}`);
    return id;
  }

  async findPortal(id) {
    try {
      console.log(`model-layer.findPortal(): Searching for Portal: ${id}`);

      const result = await this.db`
        SELECT * FROM portals
        WHERE id = ${id}
      `;

      if (result.count === 0) {
        console.log("model-layer.findPortal(): Portal Return Count 0");
        return null;
      }

      console.log(`model-layer.findPortal(): Returning: ${result[0].host_peer_id}`);
      console.log(result);
      return {
        hostPeerId: result[0].host_peer_id
      };

    } catch(e) {
      console.log("model-layer.findPortal(): ERROR");
      console.log(e);
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
      console.log(`model-layer.createEvent(): name: ${name} - loginHash: ${loginHash} - portalId: ${portalId}`);
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
