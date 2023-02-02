const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const popupSchema = new Schema(
    {
        links:{
            type:Array,
            required:true
        }
    }
);

module.exports = mongoose.model('Popup',popupSchema);