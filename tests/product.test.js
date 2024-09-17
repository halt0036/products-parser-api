const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app"); // Ajuste o caminho conforme necessário
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../src/models/Product");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe("Product API Endpoints", () => {
  // Teste GET /products
  test("GET /products should return a list of products", async () => {
    await Product.create({
      code: 1,
      product_name: "Product 1",
      imported_t: 1587642388,
      created_t: Date.now(),
    });
    await Product.create({
      code: 2,
      product_name: "Product 2",
      imported_t: 1587642388,
      created_t: Date.now(),
    });

    const response = await request(app)
      .get("/products")
      .query({ page: 1, limit: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].product_name).toBe("Product 1");
    expect(response.body[1].product_name).toBe("Product 2");
  });

  // Teste GET /products/:code
  test("GET /products/:code should return a product by code", async () => {
    const product = await Product.create({
      code: 1,
      product_name: "Product 1",
      imported_t: 1587642388,
      created_t: Date.now(),
    });

    const response = await request(app).get(`/products/${product.code}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.product_name).toBe("Product 1");
  });

  test("GET /products/:code should return 404 if product not found", async () => {
    const response = await request(app).get("/products/999");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Product não encontrado");
  });

  // Teste PUT /products/:code
  test("PUT /products/:code should update a product by code", async () => {
    const product = await Product.create({
      code: 1,
      product_name: "Product 1",
      imported_t: 1587642388,
      created_t: Date.now(),
    });

    const response = await request(app)
      .put(`/products/${product.code}`)
      .send({ product_name: "Updated Product 1" });

    expect(response.statusCode).toBe(200);
    expect(response.body.product_name).toBe("Updated Product 1");
  });

  test("PUT /products/:code should return 404 if product not found", async () => {
    const response = await request(app)
      .put("/products/999")
      .send({ product_name: "Updated Product" });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Product não encontrado");
  });

  // Teste DELETE /products/:code
  test("DELETE /products/:code should move a product to trash", async () => {
    const product = await Product.create({
      code: 1,
      product_name: "Product 1",
      imported_t: 1587642388,
      created_t: Date.now(),
    });

    const response = await request(app).delete(`/products/${product.code}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Product movido para lixeira");
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.status).toBe("trash");
  });

  test("DELETE /products/:code should return 404 if product not found", async () => {
    const response = await request(app).delete("/products/999");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Product não encontrado");
  });
});
