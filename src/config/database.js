const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado ao MongoDB");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err.message);
    process.exit(1); // Sair do processo em caso de erro
  }
};

module.exports = connectDB;
