const pool = require("../config/db");

// Código do PostgreSQL para violação de UNIQUE.
const VIOLACAO_UNIQUE = "23505";

class CpfJaCadastradoError extends Error {}

// A garantia de CPF único é a constraint UNIQUE de tbcandidato.cpf.
// Não fazemos SELECT antes do INSERT: dois cadastros simultâneos
// passariam pelo SELECT e o banco é quem decide no fim.
async function criar({ cpf, nome, email, senhaHash }) {
    try {
        const resultado = await pool.query(
            `INSERT INTO tbcandidato
                (cpf, nome_completo, email, senha_hash, data_aceite_termos)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             RETURNING id, cpf, nome_completo, email, data_cadastro`,
            [cpf, nome, email, senhaHash]
        );
        return resultado.rows[0];
    } catch (erro) {
        if (erro.code === VIOLACAO_UNIQUE && erro.constraint === "tbcandidato_cpf_key") {
            throw new CpfJaCadastradoError("CPF já cadastrado.");
        }
        throw erro;
    }
}

module.exports = { criar, CpfJaCadastradoError };
