require("dotenv").config();

const Server = require("./lib/server.js");

async function startServer(id) {
  process.on('unhandledRejection', (error) => {
    console.error(error.stack);
  });

  let server;

  if (process.env.PULSAR_STATUS === "dev") {
    const dbSetup = require("./node_modules/@databases/pg-test/jest/globalSetup");
    //const dbTeardown = require("./node_modules/@databases/pg-test/jest/globalTeardown");
    console.log("Setting up DB Mock");
    await dbSetup();

    const dbUrl = process.env.DATABASE_URL;
    // this gives us something like postgres://test-user@localhost:5432/test-db
    // We then need to map these values to where the API server expects,
    const dbUrlReg = /postgres:\/\/([\/\S]+)@([\/\S]+):(\d+)\/([\/\S]+)/;
    const dbUrlParsed = dbUrlReg.exec(dbUrl);

    // set the parsed URL as proper env
    process.env.DB_HOST = dbUrlParsed[2];
    process.env.DB_USER = dbUrlParsed[1];
    process.env.DB_DB = dbUrlParsed[4];
    process.env.DB_PORT = dbUrlParsed[3];

    server = new Server({
      port: process.env.PORT || 8080,
      githubApiUrl: process.env.GITHUB_API_URL || "https://api.github.com",
      githubClientId: process.env.GITHUB_CLIENT_ID,
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
      githubOauthToken: process.env.GITHUB_OAUTH_TOKEN,
      dbHost: process.env.DB_HOST,
      dbUser: process.env.DB_USER,
      dbPass: null,
      dbDb: process.env.DB_DB,
      dbPort: process.env.DB_PORT,
      dbSslCert: null
    });
  } else {

    server = new Server({
      port: process.env.PORT || 8080,
      githubApiUrl: process.env.GITHUB_API_URL || "https://api.github.com",
      githubClientId: process.env.GITHUB_CLIENT_ID,
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
      githubOauthToken: process.env.GITHUB_OAUTH_TOKEN,
      dbHost: process.env.DB_HOST,
      dbUser: process.env.DB_USER,
      dbPass: process.env.DB_PASS,
      dbDb: process.env.DB_DB,
      dbPort: process.env.DB_PORT,
      dbSslCert: process.env.DB_SSL_CERT
    });

  }

  await server.start();
  console.log(`Worker ${id} (pid: ${process.pid}): Listening on port ${server.port}`);
  return server;
}

module.exports = {
  startServer,
};
