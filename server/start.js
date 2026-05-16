const { spawn } = require('child_process');

function startServer() {
  console.log('Starting server with Node...');
  const server = spawn('node', ['index.js'], { stdio: 'inherit' });

  server.on('error', (err) => {
    console.error('Failed to start server:', err);
  });

  server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code} and signal ${signal}`);
    if (code !== 0) {
      console.log('Restarting in 5 seconds...');
      setTimeout(startServer, 5000);
    }
  });
}

startServer();
