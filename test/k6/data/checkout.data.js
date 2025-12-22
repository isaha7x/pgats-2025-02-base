export const checkoutData = [
  {
    items: [{ productId: 1, quantity: 1 }],
    freight: 50,
    paymentMethod: 'boleto',
  },
  {
    items: [{ productId: 1, quantity: 2 }],
    freight: 80,
    paymentMethod: 'credit_card',
    cardData: {
      number: '1234123412341234',
      name: 'Teste',
      expiry: '12/29',
      cvv: '123',
    },
  },
];
