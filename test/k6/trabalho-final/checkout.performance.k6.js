import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js"; // Funciona na maioria dos K6

import { login } from './helpers/login.js';
import { BASE_URL } from './helpers/getBaseUrl.js';
import { generateCard, generateItems } from './helpers/randomData.js';

export const checkoutTrend = new Trend('checkout_duration');

const testData = new SharedArray('users', function () {
    return JSON.parse(open('./data/users.json'));
});

export const options = {
    stages: [
        { duration: '2s', target: 2 },
        { duration: '5s', target: 2 },
        { duration: '2s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate < 0.01'],
        checkout_duration: ['p(95) < 1000'],
    },
};

export default function () {
    const user = testData[Math.floor(Math.random() * testData.length)];
    const url = __ENV.URL || BASE_URL;
    let token;

    group('Processo de Venda', function () {
        const loginRes = login(user.email, user.password);
        token = loginRes.token;

        check(loginRes, { 'autenticado com sucesso': (r) => r.token !== undefined });

        const payload = JSON.stringify({
            items: generateItems(),
            freight: 10,
            paymentMethod: 'credit_card',
            cardData: generateCard(),
        });

        const res = http.post(`${url}/checkout`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        checkoutTrend.add(res.timings.duration);
        check(res, { 'checkout status 200': (r) => r.status === 200 });
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        "summary.json": JSON.stringify(data, null, 2),
        "summary.html": textSummary(data, { indent: "  " })
    };
}
