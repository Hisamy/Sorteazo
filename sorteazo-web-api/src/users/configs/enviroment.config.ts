require('dotenv').config();

export const environment = {
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT!),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    }
}

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ;