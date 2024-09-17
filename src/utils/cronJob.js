const cron = require("node-cron");
const { importData } = require("../services/importService");

// Executa a importação diariamente às 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Iniciando a importação de dados...");
    await importData();

    // Atualizar o horário da última execução do cron
    global.lastCronExecution = new Date().toLocaleString();
    console.log("Importação de dados concluída.");
  } catch (err) {
    console.error("Erro durante a importação de dados:", err.message);
  }
});
