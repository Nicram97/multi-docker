import { redisHost, redisPort, pgUser, pgHost, pgDatabase, pgPassword, pgPort } from "./keys.js";
import { createClient } from 'redis';
import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import pg from 'pg';

async function main() {
    // express
    const app = express();
    app.use(cors());
    app.use(bodyParser.json())

    // postgres
    const { Pool } = pg;
    
    const pool = new Pool({
        user: pgUser,
        host: pgHost,
        database: pgDatabase,
        password: pgPassword,
        port: pgPort,
        // usage for postgres as a cloud service 
        // ssl: 
        //     process.env.NODE_ENV !== 'production'
        //     ? false
        //     : { rejectUnauthorized: false }
    });

    const pgClient = await pool.connect();
    pgClient.on('error', () => console.error('Lost PG connection'));

    pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.error(err));

    // redis
    const redisClient = createClient({
        url: `redis://${redisHost}:${redisPort}`,
        socket: {
            reconnectStrategy: () => 1000
        }
    }).on('error', err => console.log('Redis Client Error', err))

    await redisClient.connect();

    const redisPublisher = redisClient.duplicate();
    await redisPublisher.connect()

    // express route handlers

    app.get('/', (req, res) => {
        res.send('Hi');
    });

    app.get('/values/all', async (req, res) => {
        const values = await pgClient.query('SELECT * FROM values');

        res.send(values.rows);
    });

    app.get('/values/current', async (req, res) => {
        const values = await redisClient.hGetAll('values');
        res.send(values);
    });

    app.post('/values', async (req, res) => {
        const index = req.body.index;

        if (parseInt(index) > 40) {
            return res.status(422).send('Index too high');
        }

        redisClient.hSet('values', index, 'Nothing yet!');
        await redisPublisher.publish('insert', index);
        pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

        res.send({ working: true});

    });

    app.listen(5000, (err) => {
        console.log('Server Listening');
    })
};


main();