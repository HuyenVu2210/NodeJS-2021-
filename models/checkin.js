const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const checkinSchema = new Schema({
  start: {
    type: Date,
    // required: true
  },
  workplace: {
    type: String,
    // required: true
  },
  end: {
    type: Date,
    // required: true
  },
  staffId: {
    type: Schema.Types.ObjectId,
    refer: 'Staff'
  }
});

module.exports = mongoose.model('Checkin', checkinSchema);

