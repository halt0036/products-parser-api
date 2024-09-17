const Product = require("../models/Product");
const { importData } = require("../services/importService");

// GET /products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const product = await Product.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /products/:code
exports.getProductByCode = async (req, res) => {
  try {
    const product = await Product.findOne({ code: req.params.code });
    if (!product)
      return res.status(404).json({ message: "Product não encontrado" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /products/:code
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { code: req.params.code },
      req.body,
      { new: true }
    );
    if (!product)
      return res.status(404).json({ message: "Product não encontrado" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /products/:code
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { code: req.params.code },
      { status: "trash" },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ message: "Product não encontrado" });
    res.status(200).json({ message: "Product movido para lixeira" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rota rpovisória para facilitar testes de importação
exports.importProducts = async (req, res) => {
  try {
    await importData();

    res
      .status(200)
      .json({ message: "Teste de imortação realizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
