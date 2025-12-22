import http from 'k6/http';

export function checkout(baseUrl, token, data) {
  return http.post(
    `${baseUrl}/api/checkout`,
    JSON.stringify(data),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
