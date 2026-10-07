# Login do candidato (desenvolvimento local)

Execute os comandos a partir de backend. O cadastro e o esquema SQL nao foram alterados.

## Configuracao e execucao

1. Instale dependencias com `npm install`.
2. Use `.env.example` da raiz como referencia para `backend/.env` (ignorado pelo Git).
3. Preencha PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD localmente.
4. Defina NODE_ENV=development e SESSION_SECRET com pelo menos 32 bytes aleatorios.
   Para gerar um segredo local: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
   Nao compartilhe essa saida nem coloque o segredo em arquivos versionados.
5. Inicie com `npm run dev` e abra `http://localhost:3000/pages/login.html` (ajuste a porta).
   Use o Express para servir o frontend; nao abra o HTML com file:// ou por outra porta.

O Pool existente le as variaveis DB_*. O schema deve estar aplicado no PostgreSQL;
esta implementacao nao cria nem altera tabelas. O segredo ausente impede iniciar o servidor.
A sessao local usa MemoryStore: dura ate duas horas e se perde ao reiniciar o servidor.
NODE_ENV=production exige configurar um store persistente e HTTPS; a inicializacao
atual recusa producao sem store. Nao foram criadas tabelas de sessao no banco.

## Candidato de teste

Execute `npm run criar-candidato:dev` em um terminal interativo. Informe seu nome,
CPF e e-mail nos prompts; a senha e sua confirmacao ficam ocultas (sem asteriscos).
Os dados nao sao recebidos por argumentos, arquivos ou variaveis de ambiente.
Use uma senha com pelo menos 8 caracteres e no maximo 72 bytes UTF-8.
O script grava somente o hash bcrypt (custo 12), nao imprime dados pessoais, senha,
hash ou detalhes de erros do banco. Se o CPF existir, nao altera o registro, inclusive
em uma corrida entre insercoes. Nao registra aceite de termos automaticamente.
O registro so e criado quando voce executar e concluir os prompts; nenhum usuario
real e criado pelos testes automatizados.

## Contrato HTTP

- POST /api/login: JSON { cpf, senha }. CPF aceita pontos, hifen e espacos;
  exige 11 digitos apos remover esses separadores. Nao valida digitos verificadores.
  A senha e usada exatamente como recebida, inclusive espacos. Rejeita mais de
  72 bytes para evitar truncamento pelo bcrypt. Retorna 400 para entrada invalida,
  401 com "CPF ou senha inválidos" para CPF ausente ou senha errada, 200 no sucesso.
- GET /api/sessao: 200 com { candidato: { id } }; 401 sem sessao autenticada.
- POST /api/logout: destroi a sessao e expira o cookie, retornando 200.

O cookie portal.sid contem apenas o identificador assinado da sessao; os dados
ficam no servidor. Tem HttpOnly, SameSite=Lax, path=/ e validade de duas horas.
Secure fica desativado no HTTP local, e ativado em producao.
Cada login bem-sucedido regenera o ID da sessao antes de armazenar candidatoId.
Nao ha senha, hash, CPF ou e-mail na sessao nem na resposta do login.
As rotas rejeitam POST com Origin diferente da origem do servidor.

A pagina index.html existente esta vazia; por isso nao ha redirecionamento.
O formulario mostra sucesso e informa que a area do candidato ainda nao existe.
Quando houver uma pagina apropriada, alinhar o destino e sua protecao no backend.
O middleware `src/middleware/autenticacao.js` protege GET /api/sessao e deve ser
aplicado antes de qualquer rota privada nova. Nenhuma outra rota privada existe
atualmente. A rota de temas existente nao era montada no app e foi preservada.
Paginas estaticas permanecem publicas; conteudo privado futuro precisa de controle
no servidor antes de express.static, alem da protecao das respectivas APIs.

## Verificacao

Execute `npm test`: usa bcrypt real, servidor HTTP real e Pool simulado, sem banco
nem dados pessoais. Cobre CPF formatado, senha com espacos, limites, mensagens
iguais, consulta parametrizada, cookie, renovacao de sessao, logout, acesso sem
login, origem externa e erro de banco.

Para o teste completo com PostgreSQL:
1. Configure backend/.env e confira a disponibilidade do banco.
2. Execute o script interativo e depois `npm run dev`.
3. Tente CPF ausente e senha errada: ambos devem mostrar a mesma mensagem.
4. Entre com seu CPF formatado e a senha exata, incluindo espacos se houver.
5. No console do navegador da mesma origem, execute:
   `fetch('/api/sessao').then(async r => console.log(r.status, await r.json()))`.
6. Execute `fetch('/api/logout', { method: 'POST' })` e repita a consulta de sessao:
   deve retornar 401. Confira tambem a expiracao do cookie nas ferramentas do navegador.

## Alinhamento com quem implementa cadastro

Salvar CPF sem pontuacao e senha_hash gerado por bcrypt.hash(senha, 12), com salt
automatico. Nao aplicar trim, normalizacao Unicode ou transformacao na senha;
validar o mesmo limite de 72 bytes e combinar a politica de senha minima no cadastro.
Manter nomes de colunas de tbcandidato e nao armazenar senha em texto puro.
O login apenas confere credenciais existentes; nao aplica requisitos de senha nova.
Alinhar destino pos-login, aceite de termos e quais recursos serao privados.
Antes de publicar, configurar armazenamento de sessoes persistente, HTTPS/proxy
confiavel e limites de tentativas de login. O MemoryStore e exclusivo de desenvolvimento.

## Persistencia dos candidatos

O script de desenvolvimento insere um cadastro normal na tabela tbcandidato do
mesmo PostgreSQL usado por POST /api/login. Nao ha tabela de usuarios de teste,
marcador temporario ou tratamento especial no login. A insercao usa autocommit:
o registro permanece ao encerrar o script ou reiniciar o servidor.
A expiracao ou perda da sessao nao exclui o candidato.

Servidor e script carregam backend/.env por caminho absoluto relativo ao arquivo,
independentemente da pasta de onde sao iniciados. Variaveis ja definidas no ambiente
continuam tendo prioridade, conforme o comportamento do dotenv.

O seed existente so insere temas e os testes de login usam Pool simulado, sem
limpeza ou alteracao de candidatos reais. O script preserva CPFs existentes e
nao atualiza ID, nome ou senha_hash. Nao e necessario executar o script novamente
para entrar com um candidato ja cadastrado.
