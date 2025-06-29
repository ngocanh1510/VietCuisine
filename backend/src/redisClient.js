import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Kết nối đến Redis Cloud
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Lỗi Redis:', err));

(async () => {
    await redisClient.connect();
    console.log('Connected to Redis');
})();

export default redisClient;