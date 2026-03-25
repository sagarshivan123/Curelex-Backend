const mongoose = require("mongoose");
const slotSchema=require("./slotModel")


const doctorSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },

  specialization:String,

  isAvailable:{
    type:Boolean,
    default:true
  },


},{timestamps:true});


module.exports = mongoose.model("Doctor",doctorSchema);