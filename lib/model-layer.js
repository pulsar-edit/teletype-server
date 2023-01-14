const assert = require('assert')
const bugsnag = require('bugsnag')
const crypto = require('crypto')
const uuid = require('uuid/v4')

module.exports =
class ModelLayer {
  constructor ({db, hashSecret}) {
    this.db = db
    this.hashSecret = hashSecret
    assert(this.hashSecret != null, 'Hash secret cannot be empty')
  }

  async createPortal ({hostPeerId}) {
    const id = uuid();
    const command = await this.db`
      INSERT INTO portals
      (id, host_peer_id) VALUES
      (${id}, ${hostPeerId})
      RETURNING id;
    `;

    if (command.count === 0) {
      // TODO: An error has occured, but there is no obvious way to communicate that
    }
    return id;
  }

  async findPortal (id) {
    try {
      const result = await this.db`
        SELECT * FROM portals
        WHERE id = ${id}
        RETURNING *;
      `;

      if (result.count === 0) {
        // It seems likely that this function is intended to return null
        // when there are no results. Which a count of 0 indicates.
        return null;
      }
      return {
        hostPeerId: result[0].host_peer_id
      };
    } catch (e) {
      const malformedUUIDErrorCode = '22P02'
      if (e.code === malformedUUIDErrorCode) return null
    }
  }

  async createEvent (event) {
    try {
      const {name, identity, portalId} = event
      const loginHash = crypto.createHash('sha1').update(identity.id + this.hashSecret).digest('hex')
      const command = await this.db`
        INSERT INTO events
        (name, user_id, portal_id, created_at) VALUES
        (${name}, ${loginHash}, ${portalId}, ${Date.now()})
        RETURNING *;
      `;

      if (command.count === 0) {
        // There was an error here, and since this is wrapped in a try catch, lets throw.
        throw Error("A generic error occured creating Event");
      }
    } catch (error) {
      bugsnag.notify(error, event)
    }
  }

  getEvents () {
    const command = this.db`
      SELECT * FROM events
      ORDER BY created_at ASC
      RETURNING *;
    `;
    if (command.count === 0) {
      // An error occured, with no obvious way to return.

    }
    return command[0];
  }

  async isOperational () {
    try {
      //await this.db.one('select')
      // TODO: Determine purpose
      return true
    } catch (error) {
      return false
    }
  }
}
