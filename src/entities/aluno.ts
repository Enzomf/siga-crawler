export class Aluno {
  nome: string;
  ra: string;
  emailInstitucional: string;
  emailPessoal: string;
  dataNascimento: string;
  curso: string;
  semestresCursados: string;
  cicloAtual: string;
  periodoCurso:string;
  disciplinasMatriculadas: { nome: string; codigo: string }[];

  constructor({
    cicloAtual,
    curso,
    dataNascimento,
    disciplinasMatriculadas,
    emailInstitucional,
    emailPessoal,
    nome,
    ra,
    periodoCurso,
    semestresCursados,
  }: Aluno) {
    this.cicloAtual = cicloAtual;
    this.curso = curso;
    this.dataNascimento = dataNascimento;
    this.disciplinasMatriculadas = disciplinasMatriculadas;
    this.emailInstitucional = emailInstitucional;
    this.emailPessoal = emailPessoal;
    this.nome = nome;
    this.ra = ra;
    this.semestresCursados = semestresCursados;
    this.periodoCurso = periodoCurso;
  }
}
