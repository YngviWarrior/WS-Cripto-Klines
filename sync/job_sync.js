import CreateConnection from '../db/mysql.js';
import axios from 'axios';

const Conn = CreateConnection();

function syncData(parity, resolution, data, mts) {
    if(data.length == 0 || (data[0][0] == mts && data.length == 1)) {
        console.log(`No new data || Sync ${parity[1].symbol}(${resolution})`)
        return;
    }

    if(data[0] == "error") {
        console.log(`Unexpected Error || Sync ${parity[1].symbol}(${resolution})`)
        return;
    }

    let query = '';
    var mts, open, close, high, low, volume;

    data.map(async (candle, i) => {
        mts = candle[0];
        open = candle[1].toFixed(8);
        close = candle[2].toFixed(8);
        high = candle[3].toFixed(8);
        low = candle[4].toFixed(8);
        volume = candle[5].toFixed(8);

        query += `(${parity[1].id}, ${mts}, ${open}, ${close}, ${high}, ${low}, ${volume}),`

        if(i == (data.length - 1)){
            query = query.slice(0, -1);
        }
    });

    Conn.query(`INSERT IGNORE INTO candle_${resolution} (id_moedas_pares,mts, open, close, high, low, volume) VALUES ${query}`, (err, result, field) => {
        if (err) {
            throw err
        }

        console.log(`Ending Sync ${parity[1].symbol}(${resolution})`)
    })

    return;
}

async function syncCandles(parity, resolution) {
    console.log(`Sync ${parity[1].symbol}(${resolution})`)
    
    Conn.query(`SELECT mts
    FROM candle_${resolution}
    WHERE id_moedas_pares = ${parity[1].id} AND volume > 0
    ORDER BY mts DESC
    LIMIT 0,1`, (err, result, field) => {
        if (err) {
            throw err
        }

        let mts;
        result[0] == undefined ? mts = 1603754788000 : mts = result[0].mts;
        let timestamp = new Date().getTime();

        axios.get(`https://api-pub.bitfinex.com/v2/candles/trade:${resolution}:t${parity[1].sync_symbol}/hist`, {
            params: {
                start: mts,
                end: timestamp,
                sort: 1,
                limit: 10000
            }
        }).then((response) => {
            syncData(parity, resolution, response.data, mts)
        }).catch((err) => {
            if(err?.request){
                console.log(`Error: Status ${err.request.res.statusCode} (${err.request.res.statusMessage}) || Sync ${parity[1].symbol}(${resolution})`)
            } else {
                console.log(err)
            }
        })
    })
}

export default syncCandles