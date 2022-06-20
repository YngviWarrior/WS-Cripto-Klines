import './sync/sync.js';
import startSync from './socket_sync/socket_sync.js';
import appWs from './app-ws.js';

import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 5 });

startSync(cache);
appWs(cache);
