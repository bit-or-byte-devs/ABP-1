// Hash de senha com scrypt, nativo do Node (sem dependência extra).
// Formato salvo em senha_hash: scrypt$<salt hex>$<hash hex>
const crypto = require("crypto");

const TAMANHO_CHAVE = 64;

function gerarHash(senha) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16);
        crypto.scrypt(senha, salt, TAMANHO_CHAVE, (erro, chave) => {
            if (erro) return reject(erro);
            resolve(`scrypt$${salt.toString("hex")}$${chave.toString("hex")}`);
        });
    });
}

module.exports = { gerarHash };
