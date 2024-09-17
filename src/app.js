const express = require("express");
const app = express();
const productController = require("./controllers/productController");

// Middleware para parsing JSON
app.use(express.json());

// Adiciona a rota de detalhes da API na raiz (/)
app.get("/", (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  // Detalhes do status da API
  res.json({
    message: "API Detalhes",
    databaseConnection: "OK", // Você pode fazer uma verificação real se precisar
    lastCronExecution: global.lastCronExecution || "Cron não executado ainda",
    uptime: `${Math.floor(uptime)} segundos`,
    memoryUsage: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
  });
});

// Configurar rotas
app.get("/products", productController.getAllProducts);
app.get("/products/:code", productController.getProductByCode);
app.put("/products/:code", productController.updateProduct);
app.delete("/products/:code", productController.deleteProduct);

module.exports = app;
