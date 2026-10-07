const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

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

module.exports = app;