import http from 'k6/http';
import { check } from 'k6';
import { generateRandomEmail } from './random.helper.js';

export function registerUser(baseUrl, password) {
  const email = generateRandomEmail();

  const payload = JSON.stringify({
    name: 'User K6',
    email,
    password,
  });

  const res = http.post(`${baseUrl}/api/users/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'register status is 201': (r) => r.status === 201,
  });

  return { email, password };
}

export function loginUser(baseUrl, email, password) {
  const payload = JSON.stringify({ email, password });

  const res = http.post(`${baseUrl}/api/users/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login status is 200': (r) => r.status === 200,
  });

  return res.json('token');
}
