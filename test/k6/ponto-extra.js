import http from 'k6/http';
import { sleep, check, group } from 'k6';

export const options = {
  vus: 10,
  iterations: 200,
  thresholds: {
    http_req_duration: ['p(90)<=2000', 'p(95)<=3000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  let loginResponse;
  let token;

  group('Login do usuário', () => {
    const payloadLogin = JSON.stringify({
      email: 'alice@email.com',
      password: '123456',
    });

    loginResponse = http.post(
      `${BASE_URL}/users/login`,
      payloadLogin,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    check(loginResponse, {
      'status 200 no login': (res) => res.status === 200,
      'recebe token': (res) => res.json('token') !== '',
    });

    token = loginResponse.json('token');
  });

  group('Checkout - pagamento com boleto', () => {
    const payloadCheckoutBoleto = JSON.stringify({
      items: [{ productId: 1, quantity: 1 }],
      freight: 80,
      paymentMethod: 'boleto',
    });

    const res = http.post(
      `${BASE_URL}/checkout`,
      payloadCheckoutBoleto,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    check(res, {
      'status 200 boleto': (r) => r.status === 200,
    });
  });

  group('Checkout - pagamento com cartão', () => {
    const payloadCheckoutCard = JSON.stringify({
      items: [{ productId: 1, quantity: 1 }],
      freight: 80,
      paymentMethod: 'credit_card',
      cardData: {
        number: '1234123412341234',
        name: 'Alice',
        expiry: '12/29',
        cvv: '123',
      },
    });

    const res = http.post(
      `${BASE_URL}/checkout`,
      payloadCheckoutCard,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    check(res, {
      'status 200 cartao': (r) => r.status === 200,
    });
  });

  sleep(1);
}
