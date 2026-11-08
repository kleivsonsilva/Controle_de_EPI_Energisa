// Uso (uma vez só):  node seed.js MATRICULA "NOME COMPLETO" SENHA CPF
// Cria o 1º usuário ADMINISTRATIVO e carrega materiais/kits do catalogo.json.
// Precisa do arquivo serviceAccount.json (NÃO suba para o GitHub).
const admin = require('firebase-admin');
const cat = require('./catalogo.json');
const [m, nome, senha, cpf] = process.argv.slice(2);
if (!m || !nome || !senha || !cpf) { console.log('Uso: node seed.js MATRICULA "NOME" SENHA CPF'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccount.json')) });
(async () => {
  const db = admin.firestore();
  try { await admin.auth().createUser({ email: `${m.toLowerCase()}@epi.energisa.app`, password: senha }); }
  catch (e) { if (e.code !== 'auth/email-already-exists') throw e; console.log('Login já existia, mantido.'); }
  await db.doc(`usuarios/${m}`).set({ nome: nome.toUpperCase(), m, cpf: cpf.replace(/\D/g, ''), fn: Object.keys(cat.funcoes)[0], perfil: 'adm', base: 'ITABAIANA', lot: 'DEOP', ativo: 1 });
  for (const x of cat.materiais) await db.doc(`materiais/${x.id}`).set(x);
  for (const [n, kit] of Object.entries(cat.funcoes)) await db.doc(`funcoes/${encodeURIComponent(n)}`).set({ nome: n, kit });
  console.log('Pronto! Admin criado e catálogo carregado.'); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
