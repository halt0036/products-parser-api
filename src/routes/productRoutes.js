const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/products", productController.getAllProducts);
router.get("/products/:code", productController.getProductByCode);
router.put("/products/:code", productController.updateProduct);
router.delete("/products/:code", productController.deleteProduct);
router.post("/products/import", productController.importProducts);

module.exports = router;
