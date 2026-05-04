let empresas = JSON.parse(localStorage.getItem("empresas")) || [];
let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
let demandas = JSON.parse(localStorage.getItem("demandas")) || [];

function mostrarTela(tipo) {
  document.getElementById("escolha").classList.add("hidden");
  document.getElementById("empresa").classList.add("hidden");
  document.getElementById("candidato").classList.add("hidden");

  document.getElementById(tipo).classList.remove("hidden");
}

function voltar() {
  document.getElementById("empresa").classList.add("hidden");
  document.getElementById("candidato").classList.add("hidden");
  document.getElementById("escolha").classList.remove("hidden");
}

function salvarEmpresa() {
  const empresa = {
    nome: document.getElementById("empresaNome").value,
    cnpj: document.getElementById("empresaCnpj").value,
    segmento: document.getElementById("empresaSegmento").value,
    email: document.getElementById("empresaEmail").value,
    whatsapp: document.getElementById("empresaWhatsapp").value
  };

  const demanda = {
    empresa: empresa.nome,
    whatsapp: empresa.whatsapp,
    tipoVaga: document.getElementById("tipoVaga").value,
    valorDiaria: document.getElementById("valorDiaria").value,
    dataPagamento: document.getElementById("dataPagamento").value,
    local: document.getElementById("localVaga").value,
    tipoLocal: document.getElementById("tipoLocal").value
  };

  if (!empresa.nome || !empresa.cnpj || !demanda.tipoVaga) {
    alert("Preencha os dados principais da empresa e da demanda.");
    return;
  }

  empresas.push(empresa);
  demandas.push(demanda);

  localStorage.setItem("empresas", JSON.stringify(empresas));
  localStorage.setItem("demandas", JSON.stringify(demandas));

  alert("Empresa e demanda salvas com sucesso!");

  limparCampos();
  listarDemandas();
  voltar();
}

function salvarCandidato() {
  const candidato = {
    nome: document.getElementById("candNome").value,
    cpf: document.getElementById("candCpf").value,
    rg: document.getElementById("candRg").value,
    endereco: document.getElementById("candEndereco").value,
    cep: document.getElementById("candCep").value,
    email: document.getElementById("candEmail").value,
    whatsapp: document.getElementById("candWhatsapp").value
  };

  if (!candidato.nome || !candidato.cpf || !candidato.whatsapp) {
    alert("Preencha nome, CPF e WhatsApp.");
    return;
  }

  candidatos.push(candidato);
  localStorage.setItem("candidatos", JSON.stringify(candidatos));

  alert("Candidato cadastrado com sucesso!");

  limparCampos();
  listarCandidatos();
  voltar();
}

function listarDemandas() {
  const lista = document.getElementById("listaDemandas");
  lista.innerHTML = "";

  if (demandas.length === 0) {
    lista.innerHTML = "<p>Nenhuma demanda cadastrada ainda.</p>";
    return;
  }

  demandas.forEach((d) => {
    const numero = d.whatsapp.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá, tenho interesse na vaga: ${d.tipoVaga}, diária de R$ ${d.valorDiaria}.`
    );

    lista.innerHTML += `
      <div class="item">
        <p><strong>Empresa:</strong> ${d.empresa}</p>
        <p><strong>Vaga:</strong> ${d.tipoVaga}</p>
        <p><strong>Valor da diária:</strong> R$ ${d.valorDiaria}</p>
        <p><strong>Data de pagamento:</strong> ${d.dataPagamento}</p>
        <p><strong>Local:</strong> ${d.local}</p>
        <p><strong>Tipo:</strong> ${d.tipoLocal}</p>
        <a class="whatsapp" target="_blank" href="https://wa.me/55${numero}?text=${mensagem}">
          Candidatar pelo WhatsApp
        </a>
      </div>
    `;
  });
}

function listarCandidatos() {
  const lista = document.getElementById("listaCandidatos");
  lista.innerHTML = "";

  if (candidatos.length === 0) {
    lista.innerHTML = "<p>Nenhum candidato cadastrado ainda.</p>";
    return;
  }

  candidatos.forEach((c) => {
    lista.innerHTML += `
      <div class="item">
        <p><strong>Nome:</strong> ${c.nome}</p>
        <p><strong>CPF:</strong> ${c.cpf}</p>
        <p><strong>RG:</strong> ${c.rg}</p>
        <p><strong>Endereço:</strong> ${c.endereco}</p>
        <p><strong>CEP:</strong> ${c.cep}</p>
        <p><strong>E-mail:</strong> ${c.email}</p>
        <p><strong>WhatsApp:</strong> ${c.whatsapp}</p>
      </div>
    `;
  });
}

function limparCampos() {
  document.querySelectorAll("input, select").forEach((campo) => {
    campo.value = "";
  });
}

listarDemandas();
listarCandidatos();
