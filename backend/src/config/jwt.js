// This file holds JWT (JSON Web Token) related configurations
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkeyfallback', // Use the secret from .env, or a fallback for dev
    jwtExpiresIn: '1h' // Token expiration time (e.g., '1h' for 1 hour, '30d' for 30 days)
};