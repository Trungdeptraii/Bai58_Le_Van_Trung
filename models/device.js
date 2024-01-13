'use strict';
const { types } = require('pg');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Device.belongsTo(models.Customer, {
        as: 'customer'
      })
    }
  }
  Device.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    version: DataTypes.STRING,
    type: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    req_last: DataTypes.DATE,
    customerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Device',
    tableName: 'devices',
    timestamps: false
  });
  return Device;
};