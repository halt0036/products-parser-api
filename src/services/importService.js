const Product = require("../models/Product");
const ImportHistory = require("../models/importHistoryModel");
const axios = require("axios");
const readline = require("readline");
const zlib = require("zlib");

// Função para obter a lista de arquivos do index
const getFileList = async () => {
  try {
    const response = await axios.get(
      "https://challenges.coode.sh/food/data/json/index.txt"
    );
    return response.data
      .split("\n")
      .filter((filename) => filename.trim() !== "");
  } catch (err) {
    console.error("Erro ao obter lista de arquivos:", err.message);
    throw err;
  }
};

// Função para registrar o histórico de importação
const logImportHistory = async (status, details = "") => {
  try {
    const historyEntry = new ImportHistory({ status, details });
    await historyEntry.save();
    console.log("Histórico de importação registrado com sucesso");
  } catch (err) {
    console.error("Erro ao registrar o histórico de importação:", err.message);
  }
};

// Função para mapear e limpar os dados do JSON para o modelo Product
const mapProductData = (data) => {
  return {
    code: parseInt(data.code.replace(/[^0-9]/g, ""), 10), // Remove caracteres não numéricos e converte para número
    imported_t: new Date(), // Data de importação
    url: data.url || "",
    creator: data.creator || "",
    created_t: parseInt(data.created_t, 10),
    last_modified_t: parseInt(data.last_modified_t, 10),
    product_name: data.product_name || "",
    quantity: data.quantity || "",
    brands: data.brands || "",
    categories: data.categories || "",
    labels: data.labels || "",
    cities: data.cities || "",
    purchase_places: data.purchase_places || "",
    stores: data.stores || "",
    ingredients_text: data.ingredients_text || "",
    traces: data.traces || "",
    serving_size: data.serving_size || "",
    serving_quantity: parseFloat(data.serving_quantity) || 0,
    nutriscore_score: parseFloat(data.nutriscore_score) || 0,
    nutriscore_grade: data.nutriscore_grade || "",
    main_category: data.main_category || "",
    image_url: data.image_url || "",
  };
};

// Função para descompactar e processar o stream, parando após 100 produtos
const decompressAndProcessStream = async (responseStream) => {
  return new Promise((resolve, reject) => {
    const unzipStream = zlib.createGunzip();

    // Cria uma interface para ler o stream linha a linha
    const rl = readline.createInterface({
      input: responseStream.pipe(unzipStream),
      crlfDelay: Infinity,
    });

    let productCount = 0; // Contador de produtos
    const maxProducts = 100; // Máximo de produtos a serem processados
    const products = []; // Array para armazenar os produtos a serem inseridos

    rl.on("line", async (line) => {
      if (productCount < maxProducts) {
        try {
          // Processa cada linha como um objeto JSON
          const value = JSON.parse(line);
          const productData = mapProductData(value);
          products.push(productData); // Adiciona o produto ao array

          productCount++;

          // Se atingiu o máximo de produtos, insere todos de uma vez
          if (productCount === maxProducts) {
            // Fecha o stream de leitura
            rl.close();

            // Insere todos os produtos de uma vez no banco de dados
            try {
              await Product.insertMany(products);
              console.log(
                `Inseridos ${productCount} produtos no banco de dados.`
              );
            } catch (err) {
              console.error("Erro ao inserir produtos:", err.message);
              reject(err);
              return;
            }
          }
        } catch (err) {
          console.error("Erro ao processar linha:", err.message);
        }
      }
    });

    rl.on("close", () => {
      // Verifica se há produtos restantes para inserir
      if (products.length > 0 && productCount < maxProducts) {
        Product.insertMany(products)
          .then(() => {
            console.log(
              `Inseridos ${productCount} produtos no banco de dados.`
            );
            resolve();
          })
          .catch((err) => {
            console.error("Erro ao inserir produtos:", err.message);
            reject(err);
          });
      } else {
        resolve();
      }
    });

    rl.on("error", (err) => {
      reject(
        new Error("Erro durante o processamento do stream: " + err.message)
      );
    });
  });
};

// Função para baixar e processar o arquivo JSON
const downloadAndProcessFile = async (url) => {
  try {
    const response = await axios({
      method: "get",
      url,
      responseType: "stream", // Receber o arquivo como stream
    });

    // Processar o stream do arquivo compactado
    await decompressAndProcessStream(response.data).then(() =>
      console.log(`Arquivo ${url} processado com sucesso.`)
    );
  } catch (err) {
    console.error(`Erro ao processar ${url}:`, err.message);
    throw err;
  }
};

// Função principal para realizar a importação
const importData = async () => {
  try {
    const files = await getFileList();

    for (const file of files) {
      const fileUrl = `https://challenges.coode.sh/food/data/json/${file}`;
      await downloadAndProcessFile(fileUrl);
    }

    // Registrar sucesso
    await logImportHistory("success", "Importação concluída com sucesso.");
  } catch (err) {
    // Registrar falha
    await logImportHistory("failure", `Erro na importação: ${err.message}`);
  }
};

module.exports = {
  importData,
};
