const express=require("express");
const connectDB=require('./Database/db')
require('dotenv').config();
const appointmentRoutes =require("./Routes/appointmentRoutes.js")
const toggleRoutes=require("./Routes/doctorRoutes.js")
const consultationRoutes = require("./Routes/consultationRoutes.js");
const patientRoutes=require("./Routes/patientRoutes.js")

const app=express();
app.use(express.json());
connectDB();

//Routes
app.use("/api/patient",patientRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use("/api/doctor",toggleRoutes);
app.use("/api/consultation", consultationRoutes);
app.get("/", (req,res)=>{
  res.send("Server Running");
});
app.listen(5100,()=>{
  console.log("server is running on port 5100");
})