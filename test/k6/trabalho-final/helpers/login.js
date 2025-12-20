import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './getBaseUrl.js';

export function registerUser(user) {
  const payload = JSON.stringify({
    name: user.name,
    email: user.email,
    password: user.password,
  });

  const res = http.post(`${BASE_URL}/users/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'registro status 201': (r) => r.status === 201,
  });

  return res;
}

export function login(email, password) {
  const payload = JSON.stringify({ email, password });

  const res = http.post(`${BASE_URL}/users/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const isOk = check(res, {
    'login retorna status 200': (r) => r.status === 200,
    'token retornado': (r) => r.json('token') !== undefined,
  });

  return {
    token: res.json('token'),
    response: res
  };
}