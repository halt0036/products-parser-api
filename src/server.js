require("dotenv").config();
const app = require("./app");

const connectDB = require("./config/database");
require("./utils/cronJob"); // Importar o cron para iniciar o agendamento

const PORT = process.env.PORT || 3000;

// Conectar ao banco de dados e iniciar o servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
