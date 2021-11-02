const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Cart_item = sequelize.define('cart_item', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = Cart_item;