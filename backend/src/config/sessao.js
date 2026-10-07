const session = require('express-session');

const nomeCookie = 'portal.sid';
function opcoesCookie(producao) {
    return { httpOnly: true, sameSite: 'lax', secure: producao, path: '/' };
}

function criarSessao(env = process.env, store) {
    if (!env.SESSION_SECRET || Buffer.byteLength(env.SESSION_SECRET) < 32) {
        throw new Error('Defina SESSION_SECRET com pelo menos 32 bytes no ambiente.');
    }
    const producao = env.NODE_ENV === 'production';
    if (producao && !store) {
        throw new Error('Configure um armazenamento de sessões persistente antes de usar em produção.');
    }
    return session({
        name: nomeCookie,
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        ...(store ? { store } : {}),
        cookie: { ...opcoesCookie(producao), maxAge: 2 * 60 * 60 * 1000 },
    });
}

module.exports = { criarSessao, nomeCookie, opcoesCookie };
