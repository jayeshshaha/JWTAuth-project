const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://jayeshshah4740:Jayesh123@cluster0.cz4wg9h.mongodb.net/Example3")
.then(()=>{console.log("Database connected");})
.then((err)=>{console.log(err);})

const userSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
})

module.exports = mongoose.model("User",userSchema);
