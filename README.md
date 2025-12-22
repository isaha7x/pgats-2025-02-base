# API Checkout Rest e GraphQL

Se você é aluno da Pós-Graduação em Automação de Testes de Software (Turma 2), faça um fork desse repositório e boa sorte em seu trabalho de conclusão da disciplina.

## Instalação

```bash
npm install express jsonwebtoken swagger-ui-express apollo-server-express graphql
```

## Exemplos de chamadas

### REST

#### Registro de usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Novo Usuário","email":"novo@email.com","password":"senha123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
	-H "Content-Type: application/json" \
	-d '{"email":"novo@email.com","password":"senha123"}'
```

#### Checkout (boleto)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":1,"quantity":2}],
		"freight": 20,
		"paymentMethod": "boleto"
	}'
```

#### Checkout (cartão de crédito)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":2,"quantity":1}],
		"freight": 15,
		"paymentMethod": "credit_card",
		"cardData": {
			"number": "4111111111111111",
			"name": "Nome do Titular",
			"expiry": "12/30",
			"cvv": "123"
		}
	}'
```

### GraphQL

#### Registro de usuário
Mutation:
```graphql
mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    email
    name
  }
}

Variables:
{
  "name": "Julio",
  "email": "julio@abc.com",
  "password": "123456"
}
```

#### Login
Mutation:
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}

Variables:
{
  "email": "alice@email.com",
  "password": "123456"
}
```


#### Checkout (boleto)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
  checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
    freight
    items {
      productId
      quantity
    }
    paymentMethod
    userId
    valorFinal
  }
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "boleto"
}
```

#### Checkout (cartão de crédito)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation {
	checkout(
		items: [{productId: 2, quantity: 1}],
		freight: 15,
		paymentMethod: "credit_card",
		cardData: {
			number: "4111111111111111",
			name: "Nome do Titular",
			expiry: "12/30",
			cvv: "123"
		}
	) {
		valorFinal
		paymentMethod
		freight
		items { productId quantity }
	}
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "credit_card",
  "cardData": {
    "cvv": "123",
    "expiry": "10/04",
    "name": "Julio Costa",
    "number": "1234432112344321"
  }
}
```

#### Consulta de usuários
Query:
```graphql
query Users {
  users {
    email
    name
  }
}
```

## Como rodar

### REST
```bash
node rest/server.js
```
Acesse a documentação Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### GraphQL
```bash
node graphql/app.js
```
Acesse o playground GraphQL em [http://localhost:4000/graphql](http://localhost:4000/graphql)

## Endpoints REST
- POST `/api/users/register` — Registro de usuário
- POST `/api/users/login` — Login (retorna token JWT)
- POST `/api/checkout` — Checkout (requer token JWT)

## Regras de Checkout
- Só pode fazer checkout com token JWT válido
- Informe lista de produtos, quantidades, valor do frete, método de pagamento e dados do cartão se necessário
- 5% de desconto no valor total se pagar com cartão
- Resposta do checkout contém valor final

## Banco de dados
- Usuários e produtos em memória (veja arquivos em `src/models`)

## Testes
- Para testes automatizados, importe o `app` de `rest/app.js` ou `graphql/app.js` sem o método `listen()`

## Documentação
- Swagger disponível em `/api-docs`
- Playground GraphQL disponível em `/graphql`


# Desafio K6 - Teste de Performance API

Este projeto contém a implementação de um teste automatizado de performance utilizando o K6 para uma API construída durante o curso. O objetivo é demonstrar a aplicação de diversos conceitos de teste de performance e garantir que a API se comporte corretamente sob diferentes cenários.

## Estrutura do Projeto

pgats-2025-02-base/
│
├─ test/
│ ├─ k6/
│ │ ├─ helpers/
│ │ │ └─ auth.helper.js # Funções de autenticação reutilizáveis (Helpers)
│ │ ├─ reports/
│ │ │ ├─ report.json # Saída JSON do K6
│ │ │ └─ report.html # Relatório HTML gerado
│ │ └─ tests/
│ │ └─ checkout.test.js # Teste de checkout utilizando K6
│
└─ README.md


## Conceitos Aplicados e Localização no Código

### 1. Groups
Organiza o teste em blocos lógicos, facilitando análise de métricas por cenário.  
No `checkout.test.js`:

```javascript
group('Register User', function () {
    // cadastro do usuário
});

group('Login User', function () {
    // login do usuário e recebimento do token
});

group('Checkout Scenarios', function () {
    // execução do checkout
});

2. Helpers

Funções auxiliares para reaproveitamento de código, como autenticação.
Arquivo: helpers/auth.helper.js

2. Helpers

Funções auxiliares para reaproveitamento de código, como autenticação.
Arquivo: helpers/auth.helper.js

3. Checks

Verificações que garantem respostas corretas da API:

check(res, {
    'register status is 201': r => r.status === 201,
    'credentials created': r => r.json('id') !== undefined
});

4. Trends

Medição de métricas ao longo do tempo:

import { Trend } from 'k6/metrics';
const checkoutTrend = new Trend('checkout_duration');

checkoutTrend.add(res.timings.duration);

5. Thresholds

Definição de limites de performance:

export let options = {
    thresholds: {
        http_req_duration: ['p(95)<500']
    }
};

6. Variáveis de Ambiente

Permitem alterar parâmetros sem modificar o código:

-e BASE_URL=http://localhost:3000 -e PASSWORD=123456


No código:

const baseUrl = __ENV.BASE_URL;
const password = __ENV.PASSWORD;

7. Stages

Controle de carga ao longo do tempo:

export let options = {
    stages: [
        { duration: '5s', target: 1 },
        { duration: '10s', target: 1 },
        { duration: '5s', target: 0 },
    ]
};

8. Reaproveitamento de Resposta

O token de login é reutilizado em chamadas subsequentes:

token = loginUser(email, password);
const resCheckout = http.post(`${baseUrl}/api/checkout`, { items }, { headers: { Authorization: `Bearer ${token}` } });

9. Data-Driven Testing

Uso de diferentes dados de entrada (arrays/loops). No teste atual usamos cenário fixo, mas a arquitetura permite expansão.

Como Rodar o Projeto

Instale o K6:

sudo apt install k6


Rode o teste gerando JSON:

k6 run --out json=test/k6/reports/report.json -e BASE_URL=http://localhost:3000 -e PASSWORD=123456 test/k6/tests/checkout.test.js


Gere o relatório HTML:

node test/k6/reports/generateReport.js


Abra test/k6/reports/report.html no navegador.

Entregáveis

Repositório GitHub contendo:

Arquitetura de testes (test/k6/)

README detalhado mostrando onde cada conceito foi aplicado

Relatório de execução em HTML (report.html)

Observações

Todos os conceitos obrigatórios foram aplicados: Groups, Helpers, Checks, Trends, Thresholds, Variáveis de Ambiente, Stages, Reaproveitamento de Resposta, Data-Driven Testing.

O relatório HTML foi gerado a partir do JSON do K6, mostrando métricas consolidadas por grupo e tendências de performance.