const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const cpuCount = process.env.WEB_CONCURRENCY ? parseInt(process.env.WEB_CONCURRENCY, 10) : os.cpus().length;
  for (let i = 0; i < cpuCount; i++) cluster.fork();
  cluster.on('exit', (worker) => {
    console.error(`Worker ${worker.process.pid} died, forking new one...`);
    cluster.fork();
  });
} else {
  require('./index');
}

