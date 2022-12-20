import CreateConnection from '../db/mysql.js';
import axios from 'axios';

const Conn = await CreateConnection();

async function syncData(parity, resolution, data, mts, exchange) {
    if(data.length == 0 || (data[0][0] == mts && data.length == 1)) {
        console.log(`No new data || Sync ${parity[1].symbol}(${resolution})`);
        return;
    }

    if(data[0] == "error") {
        console.log(`Unexpected Error || Sync ${parity[1].symbol}(${resolution})`);
        return;
    }

    let query = '';
    var mts, open, close, high, low, volume;

    switch (exchange) {
        case 'Bitfinex':
            data.map(async (candle, i) => {
                mts = candle[0];
                open =  candle[1].toFixed(8);
                close = candle[2].toFixed(8);
                high = candle[3].toFixed(8);
                low = candle[4].toFixed(8);
                volume = candle[5].toFixed(8);
        
                query += `(${parity[1].id}, ${mts}, ${open}, ${close}, ${high}, ${low}, ${volume}),`;
        
                if(i == (data.length - 1)){
                    query = query.slice(0, -1);
                }
            });

            break;
    
        case 'Binance':
            data.map(async (candle, i) => {
                mts = candle[0];
                open =  candle[1];
                high = candle[2];
                low = candle[3];
                close = candle[4];
                volume = candle[5];
        
                query += `(${parity[1].id}, ${mts}, ${open}, ${close}, ${high}, ${low}, ${volume}),`;
        
                if(i == (data.length - 1)){
                    query = query.slice(0, -1);
                }
            });

            break;
    }

    Conn.query(`INSERT IGNORE INTO candle (parity, mts, open, close, high, low, volume) VALUES ${query}`, (err, result, field) => {
        if (err) {
            throw err;
        }

        console.log(`Ending Sync ${parity[1].symbol}(${resolution})`);
    });
}

function getMilliTimeSeconds(resolution, parityId){
    return new Promise(function (resolve, reject) {
        Conn.query(`SELECT mts FROM candle WHERE parity = ${parityId} AND volume > 0 ORDER BY mts DESC LIMIT 0,1`, (err, result, field) => {
            if (err) {
                return reject(err);
            }
            
            if(result[0]?.mts != undefined){
                resolve(result[0].mts);
            } else {
                resolve(1603754788000);
            }
        })
    });
}

async function syncCandles(parity, resolution) {
    console.log(`Sync ${parity[1].symbol}(${resolution})`);

    let mts = await getMilliTimeSeconds(resolution, parity[1].id);

    let timestamp = new Date().getTime();

    const rest_api = 'Binance';
    let success;
    
    switch (rest_api) {
        case 'Bitfinex':
            success = await axios.get(`https://api-pub.bitfinex.com/v2/candles/trade:${resolution}:t${parity[1].sync_symbol}/hist`, {
                params: {
                    start: mts,
                    end: timestamp,
                    sort: 1,
                    limit: 10000
                }
            }).then((response) => {
                syncData(parity, resolution, response.data, mts, rest_api);
                return true;
            }).catch((err) => {
                if(err.request != undefined){
                    console.log(`Error: Status ${err?.request?.res?.statusCode} (${err?.request?.res?.statusMessage}) || Sync ${parity[1].symbol}(${resolution})`);
                } else {
                    console.log(err.response.data);
                }
        
                return false;
            })

            break;
    
        case 'Binance':
            let symbol = parity[1].symbol;

            switch (parity[1].symbol) {
                case 'ATOUSDT':
                    symbol = 'ATOMUSDT';
                    break;
            
                case 'DSHUSDT':
                    symbol = 'DASHUSDT';
                    break;
                
                case 'DOGUSDT':
                    symbol = 'DOGEUSDT';
                    break;
            }

            success = await axios.get(`https://api.binance.com/api/v3/klines`, {
                params: {
                    symbol: symbol,
                    interval: resolution,
                    startTime: mts,
                    endTime: timestamp,
                    limit: 1000
                }
            }).then((response) => {
                console.log(response)
                syncData(parity, resolution, response.data, mts, rest_api);
                return true;
            }).catch((err) => {
                if(err.request != undefined){
                    console.log(`Error: Status ${err?.request?.res?.statusCode} (${err?.response?.data?.msg}) || Sync ${symbol}(${resolution})`);
                } else {
                    console.log(err);
                }
        
                return false;
            })

            break;
    }


    return success;
}

export default syncCandles