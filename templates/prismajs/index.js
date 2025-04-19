import http from 'http';
import app from './src/app.js';
import envConfig from './src/config/envConfig.js';

const server = http.createServer(app);

const startServer = async () => {
  server.listen(envConfig.port, () => {
    console.log(`Server is running on http://localhost:${envConfig.port}`);
  });
};

startServer();
