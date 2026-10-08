const express = require("express");
const path = require("path");
const temasRoutes = require("./routes/temas");
const candidatosRoutes = require("./routes/candidatos");

const app = express();

app.use(express.json());
// Serve o front pela mesma origem da API, para o fetch("/api/...") funcionar
app.use(express.static(path.join(__dirname, "../../frontend")));
app.use("/temas", temasRoutes);
app.use("/api/candidatos", candidatosRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Portal de Certificação funcionando!"
    });
});

module.exports = app;