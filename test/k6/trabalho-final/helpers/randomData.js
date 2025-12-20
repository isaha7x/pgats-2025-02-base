export function generateUser() {
    const nomes = ["Ana", "Bruno", "Carla", "Diego", "Elena", "Fabio", "Gisele", "Hugo"];
    const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira"];
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const id = Math.floor(Math.random() * 10000);

    return {
        name: `${rand(nomes)} ${rand(sobrenomes)}`,
        email: `aluno_${id}@email.com`,
        password: `senha${id}`,
    };
}

export function generateCard() {
    const n = () => Math.floor(Math.random() * 9000 + 1000);
    return {
        number: `4444-${n()}-${n()}-${n()}`,
        name: "USUARIO TESTE K6",
        expiry: "12/28",
        cvv: "123"
    };
}

export function generateItems() {
    const validIds = [1, 2];
    const randomId = validIds[Math.floor(Math.random() * validIds.length)];
    return [{ productId: randomId, quantity: 1 }];
}
