const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { authenticate, enforceProtocol } = require("./middleware.js");

module.exports = ({
  pubSub,
  modelLayer,
  identityProvider
}) => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(enforceProtocol);
  app.use(authenticate({ identityProvider, ignoredPaths: [ "/", "/protocol-version", "/boomtown", "/_ping" ]}));

  app.get("/protocol-version", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ version: 9 });
  });

  app.get("/ice-servers", (req, res) => {
    // We no longer are using Twilio, and as such can no longer support this URL.
    res.status(501).json({ message: "ICE-Servers are no longer supported on Pulsar" });
  });

  app.post("/peers/:id/signals", async (req, res) => {
    const { senderId, signal, sequenceNumber, testEpoch } = req.body;
    const message = { senderId, signal, sequenceNumber };

    if (testEpoch != null) {
      message.testEpoch = testEpoch;
    }

    if (sequenceNumber === 0) {
      message.senderIdentity = res.locals.identity;
    }

    pubSub.broadcast(`/peers/${req.params.id}`, 'signal', message);
    res.send({});
  });

  app.post("/portals", async (req, res) => {
    const id = await modelLayer.createPortal({ hostPeerId: req.body.hostPeerId });

    modelLayer.createEvent({
      name: "create-portal",
      identity: res.locals.identity,
      portalId: id
    });

    res.status(200).json({ id });
  });

  app.get("/portals/:id", async (req, res) => {
    modelLayer.createEvent({
      name: "lookup-portal",
      identity: res.locals.identity,
      portalId: req.params.id
    });

    const portal = await modelLayer.findPortal(req.params.id);
    if (portal) {
      res.status(200).json({
        hostPeerId: portal.hostPeerId
      });
    } else {
      res.status(404).json({});
    }
  });

  app.get("/identity", async (req, res) => {
    res.send(res.locals.identity);
  });

  app.get("/boomtown", (req, res) => {
    // We are no longer using BugSnag or BoomTown for reporting and Telemetry.
    // So we can no longer support this endpoint URL.
    res.status(501).json({ message: "BoomTown/BugSnag is no longer supported on Pulsar" });
  });

  app.get("/_ping", async (req, res) => {
    const statuses = await Promise.all([
      pubSub.isOperational(),
      modelLayer.isOperational(),
      identityProvider.isOperational(),
    ]);

    const unhealthyServices = [];
    if (!statuses[0]) {
      unhealthyServices.push("pubSub");
    }
    if (!statuses[1]) {
      unhealthyServices.push("db");
    }
    if (!statuses[2]) {
      unhealthyServices.push("identityProvider");
    }

    if (unhealthyServices.length === 0) {
      res.status(200).json({
        now: Date.now(),
        status: "ok"
      });
    } else {
      res.status(503).json({
        now: Date.now(),
        status: "failures",
        failures: unhealthyServices
      });
    }
  });

  return app;
};
