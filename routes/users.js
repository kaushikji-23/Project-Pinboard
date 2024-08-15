const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pin");

const userschema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    profileimage: String,
    contact: Number,
    boards: {
      types: Array,
      default: []
    },
    posts:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
      }
    ]
    
});

userschema.plugin(plm);

module.exports = mongoose.model("user", userschema);