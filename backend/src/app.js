const express = require("express");
const temasRoutes = require("./routes/temas");

const app = express();

app.use(express.json());
app.use("/temas", temasRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Portal de Certificação funcionando!"
    });
});

module.exports = app;