import NodeCache from 'node-cache';
import WebSocket, { WebSocketServer } from 'ws';
import { allParities, checkParityResolution } from './config/resolutions.js';

function onError(ws, err) {
    ws.send(err.message);
}

function onConnection(client, req) {    
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
        parity_id = Object.values(allParities).filter(p => p.symbol == symbol)[0].id;
        // console.log('oi');            
        // setInterval(() => {
        //     console.log('oi2');
        // }, 1200);
    }
}

export default (DBConn) => {
    const wss = new WebSocketServer({ port: 3000 });

    wss.on('connection', (client, req) => {
        onConnection(client, req, DBConn)
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