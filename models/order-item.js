const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Order_item = sequelize.define('order_item', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = Order_item;