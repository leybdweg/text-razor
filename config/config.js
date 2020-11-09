const sequelizeConfigs = {
  "username": process.env.DB_USER|| 'me',
  "password": process.env.DB_PASSWORD || 'secret',
  "database": process.env.DB_SCHEME || 'my_dev',
  "host": process.env.DB_HOST || 'localhost',
  "dialect": "mysql"
}

module.exports = sequelizeConfigs
