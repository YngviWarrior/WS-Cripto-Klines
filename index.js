// import './sync/sync.js';
import startSync from './src/socket_sync/socket_sync.js';
import appWs from './src/app-ws.js';

import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 5 });

startSync(cache);
appWs(cache);
