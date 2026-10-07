const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: '10kb' }));

const { criarSessao } = require('./config/sessao');
const criarRotasLogin = require('./routes/login');
const pool = require('./config/db');
app.use(criarSessao());
app.use('/api', criarRotasLogin(pool));

// Localiza a pasta frontend.
const frontendPath = path.join(__dirname, "../../frontend");

// Disponibiliza CSS, imagens, JavaScript e páginas HTML.
app.use(express.static(frontendPath));

// Exibe a página inicial ao acessar localhost:3000.
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "pages/index.html"));
});

// Mantém uma rota para verificar a API.
app.get("/api", (req, res) => {
    res.json({
        mensagem: "API do Portal de Certificação funcionando!"
    });
});

app.use((erro, req, res, next) => {
    if (res.headersSent) return next(erro);
    // Evita registrar credenciais, hashes e detalhes pessoais vindos do banco.
    const status = erro.type === 'entity.parse.failed' ? 400 : erro.status === 413 ? 413 : 500;
    res.status(status).json({ mensagem: status === 500 ? 'Não foi possível concluir a solicitação. Tente novamente.' : 'Requisição inválida.' });
});

module.exports = app;