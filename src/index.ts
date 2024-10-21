import { credentials } from "../test_credentials.json";
import { Siga } from "./entities/siga";

export * from "./entities/aluno";
export * from "./entities/siga";

const siga = new Siga();

async function main() {
  for (const credential of credentials) {
   const aluno = await siga.getInformacoesAluno(credential);
    if(!aluno) console.log('success true: ', false);
}
  main();
}
main();