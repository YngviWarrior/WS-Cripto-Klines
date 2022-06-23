import NodeCache from 'node-cache';
import WebSocket, { WebSocketServer } from 'ws';
import { allParities, checkParityResolution } from './config/resolutions.js';

function onError(ws, err) {
    ws.send(err.message);
}

function onConnection(client, req, cache) {    
    if (!client) {
        try {
            client.on('close', onError(client, {status: 0, message: 'no Client found'}));
        } catch (e) {
            console.log(e)
        }
    } 
    
    let symbol = req.url.replace('/candle/', '').split('/')[0]
    let resolution = req.url.replace('/candle/', '').split('/')[1]
    let parity_id;

    if (checkParityResolution(symbol, resolution) === false){
        try {
            if (client.readyState === WebSocket.OPEN) {
                let error = {status: 0, message: 'no resolution found'};
                client.on('close', onError(this, error));
            }
        } catch (e) {
            return e;
        }
    }

    if (client.readyState === WebSocket.OPEN) {
        setInterval(() => {
            if (cache.get(`${symbol}/${resolution}`) != undefined) {
                client.send(cache.get(`${symbol}/${resolution}`));
            }
        }, 1000);
    }
}

export default (cache) => {
    const wss = new WebSocketServer({ port: 3000 });

    wss.on('connection', (client, req) => {
        onConnection(client, req, cache)
    });

    console.log(`App Web Socket Server is running!`);
    return wss;
}