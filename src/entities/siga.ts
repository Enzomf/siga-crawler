import * as creerio from "cheerio";
import { Aluno } from "./aluno";

export class Siga {
  private readonly loginUrl = "https://siga.cps.sp.gov.br/aluno/login.aspx";
  private readonly gxParams = {
    _EventName: "E'EVT_CONFIRMAR'.",
    _EventGridId: "",
    _EventRowId: "",
    MPW0005_CMPPGM: "login_top.aspx",
    MPW0005GX_FocusControl: "",
    vSAIDA: "",
    vREC_SIS_USUARIOID: "",
    GX_FocusControl: "vSIS_USUARIOID",
    GX_AJAX_KEY: "4EF30B741B6BBD2236C4FBE8C30A3EBB",
    AJAX_SECURITY_TOKEN:
      "2CFB37716B3A3DD908D1BEE358EC5FC13FCFF5EB9737C7E02BAB0EAEBF92D259",
    GX_CMP_OBJS: { MPW0005: "login_top" },
    sCallerURL: "",
    GX_RES_PROVIDER: "GXResourceProvider.aspx",
    GX_THEME: "GeneXusX",
    _MODE: "",
    Mode: "",
    IsModified: "1",
  };

  async getInformacoesAluno({
    senha,
    usuario,
  }: Siga.GetInformacoesAlunoParams): Promise<Aluno | null> {
    console.time('total time to fetch user info')
    const formData = this.getFormData({ senha, usuario });
    const homeHtml = await this.getHomeHtml(formData);

    if (!homeHtml || !this.checkIfLoginSucceeded(homeHtml)) return null;

    const aluno = this.getAlunoFromHtml(homeHtml!);
    console.timeEnd('total time to fetch user info')
    return aluno;
  }

  private getFormData({
    usuario,
    senha,
  }: Siga.GetInformacoesAlunoParams): FormData {
    const formData = new FormData();
    formData.append("vSIS_USUARIOID", usuario);
    formData.append("vSIS_USUARIOSENHA", senha);
    formData.append("GXState", JSON.stringify(this.gxParams));

    return formData;
  }

  private async getHomeHtml(formData: FormData): Promise<string | null> {
    const sessionId = await this.getSessionId();

    try {
      const response = await fetch(this.loginUrl, {
        method: "POST",
        body: formData,
        headers: {
          Cookie: sessionId || "",
          Connection: "keep-alive",

        },
        signal: AbortSignal.timeout(2000),
      });
      if (!response.ok) return null;

      return response.text();
    } catch (error) {
      return null;
    }
  }

  private async getSessionId(): Promise<string | null> {
    try {
      const response = await fetch(this.loginUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(2300),
        headers: { 
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) return null;

      const cookies = response.headers.get("set-cookie");
      if (!cookies) return null;

      const sessionId = cookies.split(";")[0];
      return sessionId;
    } catch (e) {
      return null;
    }
  }

  private checkIfLoginSucceeded(html: string): boolean {
    return !html.includes("<title>login</title>");
  }

  private getAlunoFromHtml(html: string): Aluno | null {
    try {
      const $ = creerio.load(html);
      const gxState = $('input[name="GXState"]').attr("value");

      if (!gxState) return null;

      const parsedGxState = JSON.parse(
        gxState.replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
      );

      const disciplinas: { nome: string; codigo: string }[] = [];

      for (const disciplina of parsedGxState.vTREENODECOLLECTIONDATA_MPAGE[0].Nodes.at(
        7
      ).Nodes) {
        disciplinas.push({
          nome: disciplina.Id,
          codigo: disciplina.Link.split("?")[1],
        });
      }

      const aluno = new Aluno({
        nome: parsedGxState.MPW0041vPRO_PESSOALNOME.split(
          "-"
        )[0].trim() as string,
        ra: parsedGxState.MPW0041vACD_ALUNOCURSOREGISTROACADEMICOCURSO as string,
        emailInstitucional: parsedGxState.MPW0041vINSTITUCIONALFATEC as string,
        emailPessoal: parsedGxState.vPRO_PESSOALEMAIL as string,
        dataNascimento: parsedGxState.vPRO_PESSOALDATANASCIMENTO as string,
        curso: parsedGxState.vACD_CURSONOME_MPAGE as string,
        periodoCurso: parsedGxState.vACD_PERIODODESCRICAO_MPAGE as string,
        semestresCursados: parsedGxState.MPW0041vSEMESTRESCURSADOS as string,
        cicloAtual: parsedGxState.MPW0041vACD_ALUNOCURSOCICLOATUAL as string,
        disciplinasMatriculadas: disciplinas as {
          nome: string;
          codigo: string;
        }[],
      });

      return aluno;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export namespace Siga {
  export type GetInformacoesAlunoParams = {
    usuario: string;
    senha: string;
  };
}
