const express = require("express");
const httpProxy = require("http-proxy");
require("dotenv").config();

const { router } = require("./routes/rest");
const slownessGenerator = require("./middlewares/slownessGenerator");
const requestStart = require("./middlewares/requestStart");
const requestEnd = require("./middlewares/requestEnd");

// number os servers which would handle requests
const NUMBER_OF_SERVERS = 2;

// Queue implementation
class FIFOQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(request) {
    this.queue.push(request);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  getLength() {
    return this.queue.length;
  }
}

// load balancer instance
const app = express();
const proxy = httpProxy.createProxyServer();

let currentTargetIndex = 0;

// creating array of servers where load balancer can forward request
const targets = Array.from(
  { length: NUMBER_OF_SERVERS },
  (_, i) => `http://localhost:500${i + 1}/`
);

const logDetails = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Round robin logic
const selectTarget = () => {
  const target = targets[currentTargetIndex];
  currentTargetIndex = (currentTargetIndex + 1) % targets.length;
  return target;
};

const addProxyHostHeader = (req, res, next) => {
  req.headers["x-forwarded-host"] = req.headers.host;
  next();
};

app.use(requestStart);

app.use(addProxyHostHeader);

// Round robin First milestone of assignment

// app.use((req, res) => {
//   const target = selectTarget();
//   logDetails(`Proxying request to: ${target}`);

//   proxy.web(req, res, { target }, (err) => {
//     if (err) {
//       console.error(`Error proxying request to: ${target}`, err);
//       res.status(500).send("Proxy error");
//     }
//   });
// });

let queue;
const strategy = process.env.QUEUE_STRATEGY;

// more strategies can be added later
switch (strategy) {
  case "FIFO":
    queue = new FIFOQueue();
    break;

  default:
    throw new Error(`Unknown queue strategy: ${strategy}`);
}

// Adding request to queue
app.use((req, res, next) => {
  queue.enqueue(req);

  next();
});

// Process requests from queues
app.use((req, res, next) => {
  if (!queue.isEmpty()) {
    const request = queue.dequeue();
    const target = selectTarget();

    proxy.web(request, res, { target }, (err) => {
      if (err) {
        res.status(500).send("Proxy error");
      }
    });
  } else {
    next();
  }
});

app.use(requestEnd);

// object of servers
var obj = {};

// instantiate several servers
for (let i = 1; i <= NUMBER_OF_SERVERS; i++) {
  obj[`app${i}`] = express();
  const PORT = 5000 + i;

  obj[`app${i}`].use((req, res, next) => {
    req.delay = (i - 1) * 20;
    next();
  });
  obj[`app${i}`].use(requestStart);
  obj[`app${i}`].use(slownessGenerator);
  obj[`app${i}`].use("/", router);
  obj[`app${i}`].use(requestEnd);
  obj[`app${i}`].listen(PORT, () => {
    console.log(PORT);
  });
}

// load balancer instance
app.listen(3000, () => {
  console.log("loadbalancer");
});
