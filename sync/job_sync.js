import CreateConnection from '../db/mysql.js';
import axios from 'axios';
import util from 'util';

const Conn = await CreateConnection();

// const query = util.promisify(Conn.query).bind(Conn)

async function getLastRegistryCandle(idParity, resolution = '1m') {
    (async () => {
        let result = 0;

       
    })()

    // (async () => {
    //     try {
    //         const result = await Conn.query(`
    //         SELECT mts
    //         FROM candle_${resolution}
    //         WHERE id_moedas_pares = ${idParity} AND volume > 0
    //         ORDER BY mts DESC
    //         LIMIT 0,1
    //         `);

    //         let timestamp = new Date().getTime();
    //         return [result, timestamp];
    //     } finally {
    //         Conn.end();
    //     }
    //   })()

    // let result = Conn.query(`
    //     SELECT mts
    //     FROM candle_${resolution}
    //     WHERE id_moedas_pares = ${idParity} AND volume > 0
    //     ORDER BY mts DESC
    //     LIMIT 0,1`);
        
    //     result.on('result', (result)=>{
    //         let timestamp = new Date().getTime();
    //         return [result, timestamp];
    //     })
        
    // let resp = Conn.query(`
    //     SELECT mts
    //     FROM candle_${resolution}
    //     WHERE id_moedas_pares = ${idParity} AND volume > 0
    //     ORDER BY mts DESC
    //     LIMIT 0,1`)

    //     console.log(resp)
        // return rows, fields
}

async function syncCandles(parity, resolution = '1m') {
    console.log(`Sync ${parity[1].symbol}`)

    Conn.query(`SELECT mts
    FROM candle_${resolution}
    WHERE id_moedas_pares = ${parity[0]} AND volume > 0
    ORDER BY mts DESC
    LIMIT 0,1`, (err, result, field) => {
        if (err) {
            throw err
        }
        let mts = result[0].mts
        let timestamp = new Date().getTime();

        axios.get(`https://api-pub.bitfinex.com/v2/candles/trade:${resolution}:t${parity[1].sync_symbol}/hist`, {
            params: {
                start: mts,
                end: timestamp,
                sort: 1,
                limit: 10000
            }
        }).then((response) => {
            // console.log(response.data)
            // SyncData(parity[0], resolution, response.data, mts)
        }).catch((err) => {
            console.log('erro')
        })
    })

}

export default syncCandles