const buildControllerLayer = require("./controller-layer.js");
const AgnosticPubSub = require("./agnostic-pub-sub.js");
const ModelLayer = require("./model-layer.js");
const IdentityProvider = require("./identity-provider.js");
const request = require("request-promise-native");
const postgres = require("postgres");
const fs = require("fs");

class Server {
  constructor(options) {
    this.port = options.port;
    this.githubApiUrl = options.githubApiUrl;
    this.githubClientId = options.githubClientId;
    this.githubClientSecret = options.githubClientSecret;
    this.githubOauthToken = options.githubOauthToken;
    this.hashSecret = options.hashSecret;
    this.dbHost = options.dbHost;
    this.dbUser = options.dbUser;
    this.dbPass = options.dbPass;
    this.dbDb = options.dbDb;
    this.dbPort = options.dbPort;
    this.dbSslCert = options.dbSslCert;
  }

  async start() {
    // Create DB
    if (process.env.PULSAR_STATUS === "dev") {
      this.db = postgres({
        host: this.dbHost,
        username: this.dbUser,
        database: this.dbDb,
        port: this.dbPort
      });
    } else {
      this.db = postgres({
        host: this.dbHost,
        username: this.dbUser,
        password: this.dbPass,
        database: this.dbDb,
        port: this.dbPort,
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync(this.dbSslCert).toString()
        }
      });
    }
    const modelLayer = new ModelLayer({
      db: this.db,
      hashSecret: this.hashSecret
    });

    const pubSub = new AgnosticPubSub({

    });

    const identityProvider = new IdentityProvider({
      request,
      apiUrl: this.githubApiUrl,
      clientId: this.githubClientId,
      clientSecret: this.githubClientSecret,
      oauthToken: this.githubOauthToken,
    })

    const controllerLayer = buildControllerLayer({
      pubSub,
      modelLayer,
      identityProvider,
    });

    return new Promise((resolve) => {
      this.server = controllerLayer.listen(this.port, resolve);
    });
  }

  stop() {
    return new Promise((resolve) => this.server.close(resolve));
  }

  async reset() {
    // This function should only ever be used during test runs.
    await this.db`
      DELETE FROM portals;
    `;

    await this.db`
      DELETE FROM events;
    `;

    if (this.pubSub) {
      this.pubSub.reset();
    }
    this.identityProvider.reset();
  }
}

module.exports = Server;
