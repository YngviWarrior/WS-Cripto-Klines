import WebSocket, { WebSocketServer } from 'ws';
import { checkParityResolution } from './config/resolutions.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 });

function onError(ws, err) {
    ws.send(err.message);
}

function sendCandle(client, symbol, resolution) {
    // let data = cache.get(`${symbol}/${resolution}`)
    // if(data == null) {
    //     client.send(JSON.stringify({resolution: resolution}));
    //     cache.set(`${symbol}/${resolution}`, symbol)
    // } else {
    //     client.send(JSON.stringify({resolution: cache.get(`${symbol}/${resolution}`)}));
    // }

    const w = new WebSocket('wss://api-pub.bitfinex.com/ws/2')
    
    w.on('message', (msg) => {
        let response = JSON.stringify(JSON.parse(msg))        
        client.send(response)
    })

    let msg = JSON.stringify({ 
      event: 'subscribe', 
      channel: 'candles', 
      key: `trade:${resolution}:t${symbol.slice(0,-1)}` //'trade:TIMEFRAME:SYMBOL'
    })

    w.on('open', () => w.send(msg))
}

function onConnection(client, req, clients) {
    const id = Math.floor(Math.random() * 100);
    const color = Math.floor(Math.random() * 360);
    const metadata = { id, color };

    clients.set(client, metadata);
    
    if (!client) {
        try {
            client.on('close', onError(client, {status: 0, message: 'no Client found'}));
        } catch (e) {
            console.log(e)
        }
    } 
    
    let symbol = req.url.replace('/candles/', '').split('/')[0]
    let resolution = req.url.replace('/candles/', '').split('/')[1]

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
        console.log(symbol)
        sendCandle(client, symbol, resolution)
    }
}

export default () => {
    const wss = new WebSocketServer({ port: 3000 });

    const clients = new Map();

    wss.on('connection', (client, req) => {
        onConnection(client, req, clients)
    });

    console.log(`App Web Socket Server is running!`);
    return wss;
}
	
function corsValidation(origin) {
    return process.env.CORS_ORIGIN === '*' || process.env.CORS_ORIGIN.startsWith(origin);
}

// function verifyClient(info, callback) {
//     if (!corsValidation(info.origin)) return callback(false);
 
//     const token = info.req.url.split('token=')[1];
 
//     if (token) {
//         if (token === '123456')
//             return callback(true);
//     }
 
//     return callback(false);
// }