// Recuperar do localStorage
const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];

const produtos = produtosSalvos.map((produto) => ({
  ...produto,
  vencimento: new Date(produto.vencimento)
}));

exibirProdutos();

// Função para solicitar a data de vencimento.
function solicitarDataVencimento() {
  let vencimento;

  while (true) {
    const vencimentoString = prompt(
      "Qual é a data de vencimento do produto (no formato DD/MM/AAAA)?"
    );

    try {
      vencimento = new Date(vencimentoString);

      if (isNaN(vencimento.getTime())) {
        throw new Error(
          "Data de vencimento inválida. Por favor, insira uma data válida no formato DD/MM/AAAA."
        );
      }

      const dataAtual = new Date();

      if (vencimento < dataAtual) {
        throw new Error(
          "Data de vencimento anterior à data atual. Por favor, insira uma data futura."
        );
      }

      break; // Sai do loop se a data de vencimento for válida e futura.
    } catch (error) {
      console.error(`Erro: ${error.message}`);
    }
  }

  return vencimento;
}

// Função para adicionar um novo produto.
function adicionarProduto() {
  const nome = prompt("Qual é o nome do produto?");
  const vencimento = solicitarDataVencimento();

  // Cria um objeto representando o novo produto.
  const novoProduto = {
    nome: nome,
    vencimento: vencimento,
    vencido: false // Inicialmente, o produto não está vencido.
  };

  // Adiciona o novo produto ao array.
  produtos.push(novoProduto);

  // Salva os produtos atualizados no localStorage.
  localStorage.setItem("produtos", JSON.stringify(produtos));

  exibirProdutos();
}

function exibirProdutos() {
  const listaProdutos = document.getElementById("listaProdutos");
  listaProdutos.innerHTML = ""; // Limpa a lista para evitar duplicatas.

  produtos.forEach((produto) => {
    const itemLista = document.createElement("li");

    if (produto.vencimento instanceof Date && !isNaN(produto.vencimento)) {
      // Verifica se 'produto.vencimento' é uma instância válida de Date.
      itemLista.textContent = `Produto: ${
        produto.nome
      }, Vencimento: ${produto.vencimento.toLocaleDateString("pt-BR")}, ${
        produto.vencido ? "Vencido" : "A vencer"
      }`;
    } else {
      console.error(
        `Erro: Produto '${produto.nome}' possui data de vencimento inválida.`
      );
      itemLista.textContent = `Produto: ${produto.nome}, Vencimento: Data inválida`;
    }

    // Adiciona botão de remover produto.
    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.onclick = () => removerProduto(produtos.indexOf(produto));
    itemLista.appendChild(botaoRemover);

    listaProdutos.appendChild(itemLista);
  });
}

function exibirProdutosVencidos() {
  const listaProdutos = document.getElementById("listaProdutos");
  listaProdutos.innerHTML = ""; // Limpa a lista para evitar duplicatas.

  const produtosVencidos = produtos.filter((produto) => produto.vencido);

  produtosVencidos.forEach((produto) => {
    const itemLista = document.createElement("li");

    if (produto.vencimento instanceof Date && !isNaN(produto.vencimento)) {
      itemLista.textContent = `Produto: ${
        produto.nome
      }, Vencimento: ${produto.vencimento.toLocaleDateString(
        "pt-BR"
      )}, Vencido`;
    } else {
      console.error(
        `Erro: Produto '${produto.nome}' possui data de vencimento inválida.`
      );
      itemLista.textContent = `Produto: ${produto.nome}, Vencimento: Data inválida`;
    }

    listaProdutos.appendChild(itemLista);
  });
}

function removerProduto(index) {
  produtos.splice(index, 1);
  exibirProdutos();
}

function diasRestantes(dataVencimento) {
  const dataAtual = new Date();
  const diferencaTempo = dataVencimento.getTime() - dataAtual.getTime();
  const diasRestantes = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
  return diasRestantes;
}

function enviarMensagemWhatsapp() {
  const mensagemCabecalho =
    "Olá, segue relação de hoje:\n*Aviso de vencimento...*\n\n";

  const produtosVencidos = produtos.filter((produto) => produto.vencido);
  const produtosProximosAVencer = produtos.filter(
    (produto) => !produto.vencido && diasRestantes(produto.vencimento) <= 10
  );

  const mensagemVencidos = produtosVencidos
    .map(
      (produto) =>
        `Produto: *${
          produto.nome
        }*\nVencimento: *${produto.vencimento.toLocaleDateString("pt-BR")}*`
    )
    .join("\n\n");
  const mensagemProximosAVencer = produtosProximosAVencer
    .map(
      (produto) =>
        `Produto: *${
          produto.nome
        }*\nVencimento: *${produto.vencimento.toLocaleDateString("pt-BR")}*`
    )
    .join("\n\n");

  const mensagemCompleta = `${mensagemCabecalho}${mensagemVencidos}\n\n*Produtos Próximos a Vencer:*\n${mensagemProximosAVencer}`;

  const linkWhatsapp = `https://wa.me/556499079658?text=${encodeURIComponent(
    mensagemCompleta
  )}`;
  window.open(linkWhatsapp, "_blank");
}
