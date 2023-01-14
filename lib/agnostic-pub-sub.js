
class AgnosticPubSub {
  constructor() {

  }

  broadcast(channelName, eventName, data) {
    channelName = channelName.replace(/\//g, '.');
    // Trigger pusher client event.
    console.log(`channelName: ${channelName}`);
    console.log(`eventName: ${eventName}`);
    console.log(`data: ${data}`);
  }

  async isOperational() {
    // TODO
    return true;
  }
}

module.exports = AgnosticPubSub;
