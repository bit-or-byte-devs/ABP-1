const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Portal de Certificação funcionando!"
    });
});

module.exports = app;