import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  googleApiKey: process.env.GOOGLE_API_KEY || 'your_google_api_key',
  caldavUrl: process.env.CALDAV_URL || 'your_caldav_url',
  dbConnectionString: process.env.DB_CONNECTION_STRING || 'your_database_connection_string',
};

export default config;