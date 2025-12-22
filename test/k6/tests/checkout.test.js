import { group, check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

import { thresholds } from '../config/thresholds.js';
import { registerUser, loginUser } from '../helpers/auth.helper.js';
import { checkout } from '../helpers/checkout.helper.js';
import { checkoutData } from '../data/checkout.data.js';

export const options = {
  stages: [
    { duration: '5s', target: 1 },
    { duration: '10s', target: 1 },
    { duration: '5s', target: 0 },
  ],
  thresholds,
};

export const checkoutDuration = new Trend('checkout_duration');


const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PASSWORD = __ENV.PASSWORD || '123456';

export default function () {
  let credentials;
  let token;

  group('Register User', () => {
    credentials = registerUser(BASE_URL, PASSWORD);

    check(credentials, {
      'credentials created': (c) => c.email !== undefined,
    });
  });

  group('Login User', () => {
    token = loginUser(BASE_URL, credentials.email, credentials.password);

    check(token, {
      'token received': (t) => t !== undefined,
    });
  });

  group('Checkout Scenarios', () => {
    checkoutData.forEach((data) => {
      const res = checkout(BASE_URL, token, data);

      checkoutDuration.add(res.timings.duration);

      check(res, {
        'checkout returned valid status': (r) => r.status === 200,
      });
    });
  });

  sleep(1);
}
