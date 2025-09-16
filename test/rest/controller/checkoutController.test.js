const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

const app = require('../../../rest/app');
const checkoutService = require('../../../src/services/checkoutService.js');

describe('Checkout Controller', () => {
  describe('POST /api/checkout', () => {
    let token;

    beforeEach(async () => {
      const respostaLogin = await request(app)
        .post('/api/users/login')
        .send({
          email: 'alice@email.com',
          password: '123456'
        });

      token = respostaLogin.body.token;
    });

    it('Deve retornar 401 quando o token estiver ausente', async () => {
      const resposta = await request(app)
        .post('/api/checkout')
        .send({
          cart: [{ productId: 1, quantity: 2 }]
        });

      expect(resposta.status).to.equal(401);
      expect(resposta.body).to.have.property('error', 'Token inválido');
    });

    it('Deve retornar 200 quando informado produto válido e pagamento com boleto', async () => {
      const resposta = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: 1, quantity: 1 }],
          freight: 80,
          paymentMethod: 'boleto'
        });

      expect(resposta.status).to.equal(200);

      const respostaEsperada = require('../fixture/response/checkoutComDadosValidosBoleto200.json');
      expect(resposta.body).to.deep.equal(respostaEsperada);
    });

    it('Deve retornar 200 quando informado produto válido e pagamento com cartão', async () => {
      const resposta = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: 1, quantity: 1 }],
          freight: 80,
          paymentMethod: 'credit_card',
          cardData: {
            number: '1234123412341234',
            name: 'Alice',
            expiry: '12/29',
            cvv: '123'
          }
        });

      expect(resposta.status).to.equal(200);

      const respostaEsperada = require('../fixture/response/checkoutComDadosValidosCartao200.json');
      expect(resposta.body).to.deep.equal(respostaEsperada);
    });

    it('Usando Mocks: Deve retornar mensagem de erro quando o produto não for encontrado', async () => {
      const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
      checkoutServiceMock.throws(new Error('Produto não encontrado'));

      const resposta = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: 10, quantity: 1 }],
          freight: 80,
          paymentMethod: 'boleto'
        });

      expect(resposta.status).to.equal(400);
      expect(resposta.body).to.have.property('error', 'Produto não encontrado');

      checkoutServiceMock.restore();
    });
  });
});
