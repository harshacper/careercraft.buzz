const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database Connected');
    await sequelize.sync({ alter: true }); // Automatically update tables to match model changes
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB };
