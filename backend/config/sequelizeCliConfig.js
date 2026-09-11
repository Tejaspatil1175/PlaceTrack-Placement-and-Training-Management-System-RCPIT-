const env = require('./env');

const isRemoteOrCloud = env.db.host !== 'localhost' && env.db.host !== '127.0.0.1';

const dialectOptions = isRemoteOrCloud
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {};

const baseConfig = {
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  dialectOptions
};

module.exports = {
  development: {
    ...baseConfig
  },
  test: {
    ...baseConfig,
    logging: false
  },
  production: {
    ...baseConfig,
    logging: false
  }
};
