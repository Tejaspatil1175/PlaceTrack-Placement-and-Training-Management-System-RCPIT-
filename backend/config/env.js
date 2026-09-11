require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Database (Railway Online MySQL / Custom MySQL)
  db: {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
    name: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
    url: process.env.MYSQL_URL || process.env.DATABASE_URL || null
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'placetrack_jwt_development_secret_key_rcpit',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'PlaceTrack RCPIT <noreply@rcpit.ac.in>'
  }
};

module.exports = env;
