import WebSocket from 'ws';
import CreateConnection from '../db/mysql.js';
import NodeCache from 'node-cache';
import { allParities, allresolutions } from '../config/resolutions.js';

const DBConn = await CreateConnection();
const cache = new NodeCache({ stdTTL: 60 });
const exchange = 'Binance';
let subscription;
let data;

export default async function startSync() {
    let list = Object.keys(allParities).map(function (key) { return allParities[key]; });
    
    allresolutions.forEach(async (resolution) => {
        list.forEach(async (parity) => {
            if(parity.symbol == 'BTCUSDT'){
                await getCandle(parity.symbol, resolution);
            }
        });
    });
}


async function getCandle(symbol, resolution) {
    let parity_id = Object.values(allParities).filter(p => p.symbol == symbol)[0].id

    // switch (resolution) {
    //     case '1m':
    //         expiration = 60;
    //         break;
    
    //     case '5m':
    //         expiration = 60 * 5;
    //         break;

    //     case '15m':
    //         expiration = 60 * 15;
    //         break;

    //     case '30m':
    //         expiration = 60 * 30;
    //         break;

    //     case '1h':
    //         expiration = 60 * 60;
    //         break;

    //     case '1d':
    //         expiration = 60 * 60 * 24;
    //         break;

    //     case '7d':
    //         expiration = 60 * 60 * 24 * 7;
    //         break;

    //     case '1month':
    //         expiration = 60 * 60 * 24 * 7 * 3;
    //         break;
    // }

    switch (exchange) {
        case 'Bitfinex':
            const wssBitfinex = new WebSocket('wss://api-pub.bitfinex.com/ws/2')
    
            subscription = JSON.stringify({ 
              event: 'subscribe', 
              channel: 'candles', 
              key: `trade:${resolution}:t${symbol.slice(0,-1)}` //'trade:TIMEFRAME:SYMBOL'
            })
    
            wssBitfinex.on('open', () => wssBitfinex.send(subscription))
    
            wssBitfinex.on('message', (candle) => {
                let response = JSON.stringify(JSON.parse(candle))
                console.log(response)
            });
    
            break;
            
        case 'Binance':
            const wssBinance = new WebSocket('wss://stream.binance.com/stream')
            
            subscription = JSON.stringify({ 
                id: 1,
                method: "SUBSCRIBE",
                params: [
                  `${symbol.toLowerCase()}@kline_${resolution}`
                ]
            });
            
            wssBinance.on('open', () => wssBinance.send(subscription))
            
            wssBinance.on('ping', (msg) => {
                wssBinance.pong();
            })
        
            wssBinance.on('message', (candle) => {
                let response = JSON.parse(candle);
        
                if (response?.stream == `${symbol.toLowerCase()}@kline_${resolution}`) {
                    let random_percent = 0;
                    let minor_plus = 0;
                    let amount = 0;
        
                    random_percent = Math.random() / 1000;
                    random_percent.toString().slice(-1) % 2 == 0 ? minor_plus = true : minor_plus = false;
        
                    minor_plus === true ? amount = response.data.k.c * (1 + random_percent) : amount = response.data.k.c * (1 - random_percent);
                    
                    data = [
                        response.data.k.t, //"mts"
                        response.data.k.o, //"open" 
                        amount.toString(), //"close"
                        response.data.k.h, //"high"
                        response.data.k.l, //"low"
                        response.data.k.v  //"volume"
                    ];

                    cache.set(symbol, JSON.stringify(data))
                    console.log(cache.get(symbol))

                    DBConn.query(`INSERT IGNORE INTO 
                                candle_${resolution} (id_moedas_pares, mts, open, close, high, low, volume) 
                                VALUES (${parity_id}, ${response.data.k.t}, ${response.data.k.o}, ${amount.toString()}, ${response.data.k.h}, ${response.data.k.l}, ${response.data.k.v})`,
                    (err, result, field) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            })
    
            break;
    }
}
