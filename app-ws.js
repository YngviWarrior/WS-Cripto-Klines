import WebSocket, { WebSocketServer } from 'ws';
import { allParities, checkParityResolution } from './config/resolutions.js';
import NodeCache from 'node-cache';
import CreateConnection from './db/mysql.js';

const Conn = CreateConnection();

const cache = new NodeCache({ stdTTL: 60 });

function onError(ws, err) {
    ws.send(err.message);
}

function sendCandle(client, parity_id, symbol, resolution) {
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

        if (response?.stream == `${symbol.toLowerCase()}@kline_${resolution}`) {
            let send;
            let random_percent = 0;
            let minor_plus = 0;
            let amount = 0;

            random_percent = Math.random() / 1000;
            random_percent.toString().slice(-1) % 2 == 0 ? minor_plus = true : minor_plus = false;

            minor_plus === true ? amount = response.data.k.c * (1 + random_percent) : amount = response.data.k.c * (1 - random_percent);
            // console.log(amount.toString())
            send = [
                response.data.k.t, //"mts"
                response.data.k.o, //"open" 
                amount.toString(), //"close"
                response.data.k.h, //"high"
                response.data.k.l, //"low"
                response.data.k.v  //"volume"
            ]

            client.send(JSON.stringify(send))

            Conn.query(`INSERT IGNORE INTO 
                        candle_${resolution} (id_moedas_pares, mts, open, close, high, low, volume) 
                        VALUES (${parity_id}, ${response.data.k.t}, ${response.data.k.o}, ${amount.toString()}, ${response.data.k.h}, ${response.data.k.l}, ${response.data.k.v})`,
            (err, result, field) => {
                if (err) {
                    throw err;
                }
            });
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
        parity_id = Object.values(allParities).filter(p => p.symbol == symbol)[0].id
        sendCandle(client, parity_id, symbol, resolution)
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