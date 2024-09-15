import { redisHost, redisPort } from "./keys.js";
import { createClient } from 'redis';

const fib = (n) => {
    if (n <= 1) return 1;
    return fib(n - 1) + fib(n - 2);
}

async function main() {
    const client = createClient({
        url: `redis://${redisHost}:${redisPort}`,
        socket: {
            reconnectStrategy: () => 1000
        }
    })
        .on('error', err => console.log('Redis Client Error', err))
    await client.connect();

    const sub = client.duplicate();
    await sub.connect();
    await sub.subscribe('insert', (message) => {
        client.hSet('values', message, fib(parseInt(message)));
    });
};


main();