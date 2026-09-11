const { Sequelize } = require('sequelize');
const env = require('./env');

let sequelize;

const isRemoteOrCloud = env.db.host !== 'localhost' && env.db.host !== '127.0.0.1';

const poolConfig = {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000
};

const dialectOptions = isRemoteOrCloud
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {};

if (env.db.url) {
  sequelize = new Sequelize(env.db.url, {
    dialect: 'mysql',
    logging: env.isProduction || env.isTest ? false : console.log,
    pool: poolConfig,
    dialectOptions
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    logging: env.isProduction || env.isTest ? false : console.log,
    pool: poolConfig,
    dialectOptions
  });
}

module.exports = sequelize;
