// import './sync/sync.js';
import startSync from './socket_sync/socket_sync.js';
import appWs from './app-ws.js';

startSync();
appWs();
