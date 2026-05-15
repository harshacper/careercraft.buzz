const { sequelize } = require('./config/db');

async function fixSchema() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('Users', 'lastIp', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true
    });
    console.log('Column lastIp added successfully');
  } catch (err) {
    console.error('Error adding column (it might already exist):', err.message);
  } finally {
    process.exit();
  }
}

fixSchema();
