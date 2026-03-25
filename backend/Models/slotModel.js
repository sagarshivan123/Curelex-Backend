const mongoose=require("mongoose");

const slotSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});

module.exports=(slotSchema);