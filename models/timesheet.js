const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const timesheetSchema = new Schema({
  staffId: {
    type: Schema.Types.ObjectId,
    refer: 'Staff'
  },
  checkin: {
    items: [
      {
        checkinId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Checkin'
        },
        time: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model('Timesheet', timesheetSchema)

