import WebSocket, { WebSocketServer } from 'ws';
import { checkParityResolution } from './config/resolutions.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 });

function onError(ws, err) {
    ws.send(err.message);
}

function sendCandle(client, symbol, resolution) {
    // const w = new WebSocket('wss://api-pub.bitfinex.com/ws/2')
    
    // let msg = JSON.stringify({ 
    //   event: 'subscribe', 
    //   channel: 'candles', 
    //   key: `trade:${resolution}:t${symbol.slice(0,-1)}` //'trade:TIMEFRAME:SYMBOL'
    // })

    // w.on('open', () => w.send(msg))

    // w.on('message', (msg) => {
    //     console.log('oi')
    //     let response = JSON.stringify(JSON.parse(msg))        
    //     client.send(response)
    // })

    const w = new WebSocket('wss://stream.binance.com/stream')
    
    let msg = JSON.stringify({ 
        id: 1,
        method: "SUBSCRIBE",
        params: [
          `${symbol.toLowerCase()}@kline_${resolution}`
        ]
    })
    
    w.on('open', () => w.send(msg))
    
    w.on('ping', (msg) => {
        let response = JSON.stringify(JSON.parse(msg))  
        console.log(response)
        w.pong()
    })

    w.on('message', (msg) => {
        let response = JSON.parse(msg)
        let send;

        if (response?.stream == `${symbol.toLowerCase()}@kline_${resolution}`) {
            send = [
                response.data.k.t, //"mts"
                response.data.k.o, //"open"
                response.data.k.c, //"close"
                response.data.k.h, //"high"
                response.data.k.l, //"low"
                response.data.k.v  //"volume"
            ]

            client.send(JSON.stringify(send))
        }
    })
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
    
    let symbol = req.url.replace('/candle/', '').split('/')[0]
    let resolution = req.url.replace('/candle/', '').split('/')[1]

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
	
// function corsValidation(origin) {
//     return process.env.CORS_ORIGIN === '*' || process.env.CORS_ORIGIN.startsWith(origin);
// }

// function verifyClient(info, callback) {
//     if (!corsValidation(info.origin)) return callback(false);
 
//     const token = info.req.url.split('token=')[1];
 
//     if (token) {
//         if (token === '123456')
//             return callback(true);
//     }
 
//     return callback(false);
// }