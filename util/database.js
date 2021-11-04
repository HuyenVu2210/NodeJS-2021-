const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://Kb3X1knoBJT4xRUR:Kb3X1knoBJT4xRUR@cluster0.6lc11.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then((results) => {
      console.log('connected');
      callback(results);
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = mongoConnect;
