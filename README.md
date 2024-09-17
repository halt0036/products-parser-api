# Products Parser API

Este projeto é um desafio fornecido pela [Coodesh](https://www.coodesh.com/), com o objetivo de fornecer uma API que gerencie dados extraídos do banco de dados **Open Food Facts**.

## Processo de Investigação

### Entendimento do Problema

A primeira etapa do desenvolvimento foi entender as necessidades do projeto e como integrar a API com uma fonte de dados externa, no caso, o **Open Food Facts**. O desafio principal era garantir que a API fosse capaz de importar grandes volumes de dados e atualizá-los de maneira eficiente e automatizada.

O sistema cumpre os seguintes requisitos:

1. **CRUD completo** para gerenciar produtos.
2. **Sincronização automática** com o banco de dados do Open Food Facts, realizada diariamente através de um **cron job**.
3. Persistência de dados utilizando **MongoDB** e a criação de campos personalizados `imported_t` e `status` em todos os produtos.

### Escolhas Técnicas e Motivações

### Escolhas Técnicas e Motivações

1. **Node.js com Express.js**: Optamos por **Node.js** pela sua alta performance e escalabilidade, ideal para o desenvolvimento de APIs rápidas e eficientes. **Express.js** foi escolhido para simplificar o roteamento de requisições HTTP e a criação de middlewares, proporcionando uma base sólida para a construção da aplicação.

2. **MongoDB**: Utilizamos o **MongoDB Atlas** devido à sua flexibilidade em lidar com dados não estruturados, alinhando-se bem com o formato JSON dos dados do Open Food Facts. A escolha do MongoDB permite um esquema dinâmico que é crucial para armazenar e gerenciar dados variados e não rígidos.

3. **Mongoose ODM**: O **Mongoose** foi adotado para facilitar a interação com o MongoDB, mapeando os documentos do banco de dados para objetos JavaScript e oferecendo uma interface conveniente para realizar operações no banco de dados.

4. **Node-cron**: Para a atualização diária dos dados, optamos por utilizar a biblioteca **node-cron**, que simplifica a criação e gerenciamento de tarefas agendadas no Node.js.

5. **Axios**: **Axios** é utilizado para realizar requisições HTTP, facilitando a comunicação com APIs externas e a manipulação das respostas recebidas.

6. **Stream-json**: **Stream-json** foi integrado para processar grandes arquivos JSON de forma eficiente, permitindo a leitura e manipulação de dados em streaming.

7. **Testes**: **Jest** e **Supertest** são utilizados para garantir a qualidade do código através de testes unitários e de integração, assegurando que a aplicação funcione conforme o esperado.

### Hipóteses e Decisões

Durante o desenvolvimento, fiz as seguintes hipóteses para otimizar o desempenho e a manutenibilidade do sistema:

1. **Limitar a importação**: Para evitar sobrecarga no sistema, a importação de produtos foi limitada a 100 itens por arquivo JSON. Como os arquivos .JSON são muito grandes, foi utilizado a leitura de uma linha por vez até 100º.

2. **Estrutura modular**: A organização do projeto segue o princípio de separação de responsabilidades. Cada módulo possui uma função específica, como controle de rotas, manipulação de dados e configuração do cron job.

## Decisões sobre a Arquitetura

### Organização de pastas

A organização das pastas segue uma estrutura modular para facilitar a escalabilidade futura. Isso foi feito visando manter o projeto manutenível e de fácil entendimento para futuros desenvolvedores que possam trabalhar na aplicação.

```bash
├── src
│   ├── config           # Configuração da aplicação (ex: conexão com MongoDB)
│   ├── controllers      # Lógica dos endpoints (CRUD de produtos)
│   ├── models           # Definição dos esquemas do MongoDB (ex: Produto)
│   ├── routes           # Definição de rotas e endpoints
│   ├── services         # Serviços responsáveis pela lógica de importação e cron jobs
│   ├── utils            # Funções utilitárias
│   ├── app.js
│   └── server.js        # Arquivo principal da aplicação
├── tests                # Testes unitários para a API
├── .env                 # Configurações de ambiente
└── README.md            # Documentação do projeto
```

### ElasticSearch

Iniciei a configuração do ElasticSearch porém encontrei dificuldades ao criar índice. Optei por não utilizar

## Instalação e Uso

### Pré-requisitos

Certifique-se de que você tenha as seguintes ferramentas instaladas em seu sistema:

- [Node.js](https://nodejs.org/en/) (versão 14+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ou outra instância de banco de dados MongoDB
- Um gerenciador de pacotes como [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Passo a Passo de Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seuusuario/food-facts-api.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd food-facts-api
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Configure as variáveis de ambiente criando um arquivo .env na raiz do projeto com as seguintes informações:

   ```bash
   MONGODB_URI=your_mongodb_connection_string
   API_PORT=3000
   ```

5. Executar o projeto em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

## Uso da API

### Endpoints

- **GET** `/`
  Retorna informações sobre a API, incluindo o status da conexão com o banco de dados, horário da última execução do CRON, tempo online da aplicação, e uso de memória.

- **GET** `/products`
  Lista todos os produtos do banco de dados, com suporte a paginação para evitar sobrecarregar o sistema. Parâmetros de paginação disponíveis: `page` e `limit`.

  ```bash
  curl "http://localhost:3000/products?page=2&limit=5"
  ```

- **GET** `/products/:code`
  Retorna as informações detalhadas de um produto específico, utilizando o código do produto como parâmetro de busca.

  ```bash
  curl http://localhost:3000/products/815360014891
  ```

- **PUT** `/products/:code`
  Atualiza as informações de um produto específico com base no código fornecido. Esse endpoint permite que dados como o status do produto sejam atualizados.

  ```bash
  curl -X PUT http://localhost:3000/products/815360014891 \
     -H "Content-Type: application/json" \
     -d '{"product_name": "Updated Product Name"}'
  ```

- **DELETE** `/products/:code`
  Altera o status de um produto para "trash" sem removê-lo definitivamente do banco de dados. Útil para manter o histórico e permitir uma possível recuperação.

  ```bash
  curl -X DELETE http://localhost:3000/products/815360014891
  ```

## Testes

Para rodar os testes unitários, utilize o seguinte comando:

```bash
npm test
```

Os testes cobrem os endpoints principais da API, garantindo que as operações de GET, PUT e DELETE estejam funcionando corretamente.

### Um endpoint adicional foi acrescentado para facilitar os testes de importação

- **POST** `/products/import`

  ```bash
  curl -X POST http://localhost:3000/products/import
  ```

## Requisitos de Importação

### Limitação de Produtos

Durante a importação, o número máximo de produtos importados de cada arquivo é limitado a 100 produtos. Esta limitação é aplicada para evitar sobrecarga e garantir um processamento eficiente.

### Implementação

- O modelo `Product` inclui os campos `imported_t` e `status`.
- O serviço de importação limita a 100 produtos por arquivo e garante que todos os produtos tenham os campos personalizados.
- O cron job realiza a importação diariamente e registra o histórico das importações.

Para mais informações, consulte o código no diretório `src/services` e `src/cron`.

## Histórico de Importações

Para controlar o histórico das importações e facilitar a validação, o projeto utiliza uma Collection secundária chamada `ImportHistory`. Esta Collection armazena informações sobre cada operação de importação, incluindo a data da importação, o status (sucesso ou falha) e detalhes adicionais.

### Estrutura da Collection

- **importDate**: Data e hora da importação.
- **status**: Status da importação (sucesso ou falha).
- **details**: Detalhes adicionais sobre a importação.

### Funcionalidade

- **Importação Agendada**: Um cron job executa a importação regularmente e registra o histórico.

Para mais informações, consulte o código no diretório `src/services` e `src/cron`.
