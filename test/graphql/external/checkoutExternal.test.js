const request = require('supertest');
const { expect } = require('chai');

describe('Checkout GraphQL - Cenários de Pagamento', () => {
    let authToken;

    // Faz login antes de cada teste
    beforeEach(async () => {
        const loginData = require('../fixture/requisicao/login/login.json');
        const response = await request('http://localhost:4000/graphql')
            .post('')
            .send(loginData);

        authToken = response.body.data.login.token;
    });

    it('Deve completar o checkout usando boleto', async () => {
        const checkoutBoleto = require('../fixture/requisicao/checkout/checkoutBoleto.json');
        const response = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${authToken}`)
            .send(checkoutBoleto);

        expect(response.status).to.equal(200);
        const checkout = response.body.data.checkout;
        expect(checkout).to.have.property('paymentMethod', 'boleto');
        expect(checkout.items[0]).to.have.property('productId', 1);
    });

    it('Deve completar o checkout usando cartão de crédito', async () => {
        const checkoutCartao = require('../fixture/requisicao/checkout/checkoutCartao.json');
        const response = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${authToken}`)
            .send(checkoutCartao);

        expect(response.status).to.equal(200);
        const checkout = response.body.data.checkout;
        expect(checkout).to.have.property('paymentMethod', 'credit_card');
        expect(checkout.items[0]).to.have.property('productId', 2);
        expect(checkout.valorFinal).to.be.a('number');
    });

    it('Deve retornar erro quando não informar token', async () => {
        const checkoutBoleto = require('../fixture/requisicao/checkout/checkoutBoleto.json');
        const response = await request('http://localhost:4000/graphql')
            .post('')
            .send(checkoutBoleto);

        expect(response.status).to.equal(200);
        expect(response.body.errors[0].message).to.equal('Token inválido');
    });
});
