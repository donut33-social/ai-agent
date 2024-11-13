const log4js = require("log4js");

log4js.configure({
  appenders: {
    db: {
      type: "dateFile",
      filename: "logs/db.log",
      pattern: "yy-MM-dd",
    },
    steem: {
      type: "dateFile",
      filename: "logs/steem.log",
      pattern: "yy-MM-dd",
    },
    space: {
      type: "dateFile",
      filename: "logs/space.log",
      pattern: "yy-MM-dd",
    },
    curation: {
      type: "dateFile",
      filename: "logs/curation.log",
      pattern: "yy-MM-dd",
    },
    tweet: {
      type: "dateFile",
      filename: "logs/tweet.log",
      pattern: "yy-MM-dd",
    },
    debox: {
      type: "dateFile",
      filename: "logs/debox.log",
      pattern: ".yy-MM-dd",
    },
    ws: {
      type: "dateFile",
      filename: "logs/ws.log",
      pattern: ".yy-MM-dd",
    },
    api: {
      type: "dateFile",
      filename: "logs/api.log",
      pattern: ".yy-MM-dd",
    },
    graph: {
      type: "dateFile",
      filename: "logs/graph.log",
      pattern: ".yy-MM-dd",
    },
    chain: {
      type: "dateFile",
      filename: "logs/chain.log",
      pattern: ".yy-MM-dd",
    },
    consoleout: {
      type: "console",
      layout: { type: "colored" },
    },
  },
  categories: {
    default: { appenders: ["api", "consoleout"], level: "debug" },
    db: { appenders: ["db", "api", "consoleout"], level: "debug" },
    steem: { appenders: ["steem", "consoleout"], level: "debug" },
    space: { appenders: ["space", "api", "consoleout"], level: "debug" },
    curation: { appenders: ["curation", "api", "consoleout"], level: "debug" },
    debox: { appenders: ["debox", "consoleout"], level: "debug" },
    ws: { appenders: ["ws", "consoleout"], level: "debug" },
    api: { appenders: ["api", "consoleout"], level: "debug" },
    graph: { appenders: ["graph", "consoleout"], level: "debug" },
    chain: { appenders: ["chain", "consoleout"], level: "debug" },
    tweet: { appenders: ["tweet", "api", "consoleout"], level: "debug" }
  },
});

module.exports = log4js;
