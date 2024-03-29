const mongoose = require("mongoose");

require("../model/config")
const walletCollection = mongoose.Schema({
    userId: {
        type: String,
    },
    creditedOnDate: {
        type: String,
    }, debitedOnDate: {
        type: String,
    },
    avaliable: {
        type: Number
    },
    creditAmount: {
        type: Number
    },
    debitedAmount: {
        type: Number
    },
    remark: {
        type: String,
    }
})

const walletData = mongoose.model("wallet", walletCollection);

module.exports = walletData;