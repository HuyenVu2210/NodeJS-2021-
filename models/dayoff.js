const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dayoffSchema = new Schema({
  staffId: {
    type: Schema.Types.ObjectId,
    refer: "Staff",
  },
  date: {
    type: Date,
  },
  totalHoursOff: {
    type: Number,
  },
});

module.exports = mongoose.model("Dayoff", dayoffSchema);
