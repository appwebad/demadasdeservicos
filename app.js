const SHEET_ID = "1Y-B929ILXwBpraBuVZdNZx-zdLO-ZrbRezPPOGe_Bko";

const SHEETS = {
  candidate: {
    name: "Candidatos",
    headers: [
      "DataCadastro",
      "ID",
      "Nome",
      "CPF",
      "RG",
      "Endereco",
      "CEP",
      "Email",
      "WhatsApp",
      "CreatedAt"
    ]
  },
  company: {
    name: "Empresas",
    headers: [
      "DataCadastro",
      "ID",
      "Nome",
      "CNPJ",
      "Segmento",
      "Email",
      "WhatsApp",
      "CreatedAt"
    ]
  },
  job: {
    name: "Vagas",
    headers: [
      "DataCadastro",
      "ID",
      "CompanyID",
      "Empresa",
      "TipoVaga",
      "ValorDiaria",
      "DataPagamento",
      "Local",
      "TipoLocal",
      "CreatedAt"
    ]
  },
  application: {
    name: "Inscricoes",
    headers: [
      "DataInscricao",
      "ID",
      "JobID",
      "CandidateID",
      "NomeCandidato",
      "EmailCandidato",
      "WhatsAppCandidato",
      "TipoVaga",
      "CompanyID",
      "Empresa",
      "CreatedAt"
    ]
  },
  log: {
    name: "Logs",
    headers: [
      "Data",
      "Mensagem",
      "Payload"
    ]
  }
};

function doGet() {
  return jsonOutput({
    status: "success",
    message: "API ativa"
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Requisição sem conteúdo.");
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.type) {
      throw new Error("Campo 'type' é obrigatório.");
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const typeConfig = SHEETS[data.type];

    if (!typeConfig) {
      throw new Error(`Tipo inválido: ${data.type}`);
    }

    const sheet = getOrCreateSheet(ss, typeConfig.name, typeConfig.headers);
    const row = buildRow(data);

    sheet.appendRow(row);

    return jsonOutput({
      status: "success",
      type: data.type,
      message: "Registro salvo com sucesso."
    });
  } catch (error) {
    saveLog(error, e);

    return jsonOutput({
      status: "error",
      message: error.message
    });
  }
}

function buildRow(data) {
  switch (data.type) {
    case "candidate":
      validateRequired(data, [
        "id",
        "name",
        "cpf",
        "rg",
        "address",
        "cep",
        "email",
        "whatsapp",
        "createdAt"
      ]);

      return [
        new Date(),
        data.id,
        data.name,
        data.cpf,
        data.rg,
        data.address,
        data.cep,
        data.email,
        data.whatsapp,
        data.createdAt
      ];

    case "company":
      validateRequired(data, [
        "id",
        "name",
        "cnpj",
        "segment",
        "email",
        "whatsapp",
        "createdAt"
      ]);

      return [
        new Date(),
        data.id,
        data.name,
        data.cnpj,
        data.segment,
        data.email,
        data.whatsapp,
        data.createdAt
      ];

    case "job":
      validateRequired(data, [
        "id",
        "companyId",
        "companyName",
        "jobType",
        "dailyRate",
        "paymentDate",
        "location",
        "placeType",
        "createdAt"
      ]);

      return [
        new Date(),
        data.id,
        data.companyId,
        data.companyName,
        data.jobType,
        data.dailyRate,
        data.paymentDate,
        data.location,
        data.placeType,
        data.createdAt
      ];

    case "application":
      validateRequired(data, [
        "id",
        "jobId",
        "candidateId",
        "candidateName",
        "candidateEmail",
        "candidateWhatsapp",
        "jobType",
        "companyId",
        "companyName",
        "createdAt"
      ]);

      return [
        new Date(),
        data.id,
        data.jobId,
        data.candidateId,
        data.candidateName,
        data.candidateEmail,
        data.candidateWhatsapp,
        data.jobType,
        data.companyId,
        data.companyName,
        data.createdAt
      ];

    default:
      throw new Error(`Tipo não suportado: ${data.type}`);
  }
}

function validateRequired(data, fields) {
  fields.forEach((field) => {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  });
}

function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const lastRow = sheet.getLastRow();

  if (lastRow === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function saveLog(error, e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const logSheet = getOrCreateSheet(ss, SHEETS.log.name, SHEETS.log.headers);

    logSheet.appendRow([
      new Date(),
      error.message || "Erro desconhecido",
      e && e.postData && e.postData.contents ? e.postData.contents : ""
    ]);
  } catch (logError) {
    Logger.log("Erro ao salvar log: " + logError.message);
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
