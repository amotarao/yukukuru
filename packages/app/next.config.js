require('dotenv').config();

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    PUBLIC_URL: process.env.PUBLIC_URL,
    GOOGLE_ANALYTICS: process.env.GOOGLE_ANALYTICS,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  },
};
