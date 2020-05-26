const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  id:{ type:String },
  name: { type:String ,default:""},
  email: { type: String, unique: true },
  alternate_email: { type: String, unique: true ,default:""},
  tel: { type: Number, default: 0 },
  birthday: { type: Date ,default:""},
  url: { type: String ,default:""} 
});
const UsersModel = mongoose.model("users", userSchema);

module.exports = UsersModel;