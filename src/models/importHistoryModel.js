const mongoose = require("mongoose");

const importHistorySchema = new mongoose.Schema({
  importDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["success", "failure"],
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
});

const ImportHistory = mongoose.model("ImportHistory", importHistorySchema);

module.exports = ImportHistory;
