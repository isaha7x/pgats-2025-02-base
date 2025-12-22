export const thresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<2000'],
  checkout_duration: ['p(95)<3000'],
};
