import CreateConnection from '../db/mysql.js';

const Conn = await CreateConnection();

const allresolutions = [
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
    '1d',
];

async function getAllParities() {
    let response = [];

    return new Promise(function (resolve, reject) {
        Conn.query(`SELECT parity, symbol FROM parity`, (err, result) => {
            if (err) throw err;

            result.forEach(p => {
                response.push(p)
            });
            
            resolve(response)
        })
    })
}

var allParities = await getAllParities();

function checkParityResolution(parity, resolution) {
    return Object.values(allParities).filter(p => p.symbol == parity)[0].symbol == parity && allresolutions.includes(resolution);
}

export { allParities, allresolutions, checkParityResolution }