document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('item-form');
  const listaItens = document.getElementById('lista-itens');
  const filtroDataInput = document.getElementById('filtro-data');
  const filtrarBtn = document.getElementById('filtrar-btn');
  const exportBtn = document.getElementById('export-btn');
  const generatePdfBtn = document.getElementById('generate-pdf-btn');
  const filtroMesInput = document.getElementById('filtro-mes');
  const filtrarMesBtn = document.getElementById('filtrar-mes-btn');

  let estoque = []; // Inicializa o array de estoque

  // Carregar dados do LocalStorage
  function carregarEstoque() {
    const estoqueSalvo = localStorage.getItem('estoque');
    if (estoqueSalvo) {
      estoque = JSON.parse(estoqueSalvo);
      atualizarLista();
    }
  }

  // Salvar dados no LocalStorage
  function salvarEstoque() {
    localStorage.setItem('estoque', JSON.stringify(estoque));
  }

  // Adicionar item ao estoque
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = document.getElementById('data').value;
    const material = document.getElementById('material').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);

    const item = { data, material, quantidade, id: generateId() };
    estoque.push(item);
    salvarEstoque();
    atualizarLista();
    form.reset();
  });

  // Function to generate a unique ID
  function generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  // Atualizar a lista de itens na tela
  function atualizarLista() {
    listaItens.innerHTML = '';
    estoque.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="item-data">${item.data}</span>
        <span class="item-material">${item.material}</span>
        <span class="item-quantidade"> ${item.quantidade}</span>
        <div class="item-actions">
          <button class="edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      listaItens.appendChild(li);
    });

    // Adiciona os event listeners para os botões de editar e excluir
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', editarItem);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', excluirItem);
    });
  }

  // Função para formatar a data no formato dd/mm/aaaa
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Filtrar por data
  filtrarBtn.addEventListener('click', () => {
    const filtroData = filtroDataInput.value;
    const estoqueFiltrado = estoque.filter(item => item.data === filtroData);
    atualizarListaFiltrada(estoqueFiltrado);
  });

  // Filtrar por mês
  filtrarMesBtn.addEventListener('click', () => {
    const filtroMes = filtroMesInput.value;
    const estoqueFiltrado = estoque.filter(item => {
      const dataItem = new Date(item.data);
      const mesItem = dataItem.getMonth() + 1; // Janeiro é 0
      return mesItem == filtroMes;
    });
    atualizarListaFiltrada(estoqueFiltrado);
  });

  // Atualizar a lista com os itens filtrados
  function atualizarListaFiltrada(estoqueFiltrado) {
    listaItens.innerHTML = '';
    estoqueFiltrado.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="item-data">${formatDate(item.data)}</span>
        <span class="item-material">${item.material}</span>
        <span class="item-quantidade"> ${item.quantidade}</span>
        <div class="item-actions">
          <button class="edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      listaItens.appendChild(li);
    });

    // Adiciona os event listeners para os botões de editar e excluir
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', editarItem);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', excluirItem);
    });
  }

  // Exportar dados para Excel (CSV)
  exportBtn.addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Material,Quantidade\r\n";

    estoque.forEach(item => {
      const row = `${formatDate(item.data)},${item.material},${item.quantidade}\r\n`;
      csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estoque.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
  });

  // Gerar PDF (filtrado)
  generatePdfBtn.addEventListener('click', () => {
    const filtroData = filtroDataInput.value;
    const estoqueFiltrado = estoque.filter(item => item.data === filtroData);

    if (estoqueFiltrado.length === 0) {
      alert('Nenhum item encontrado para a data filtrada.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.text('Relatório de Estoque (Filtrado por Data)', 10, 10);

    let y = 20;
    estoqueFiltrado.forEach(item => {
      pdf.text(`${formatDate(item.data)} - ${item.material} - Quantidade: ${item.quantidade}`, 10, y);
      y += 10;
    });

    pdf.save(`relatorio_estoque_${filtroData}.pdf`);
  });

  // Função para excluir um item
  function excluirItem(event) {
    const id = event.target.dataset.id;
    estoque = estoque.filter(item => item.id !== id);
    salvarEstoque();
    atualizarLista();
  }

  // Função para editar um item
  function editarItem(event) {
    const id = event.target.dataset.id;
    const item = estoque.find(item => item.id === id);

    // Preenche o formulário com os dados do item a ser editado
    document.getElementById('data').value = item.data;
    document.getElementById('material').value = item.material;
    document.getElementById('quantidade').value = item.quantidade;

    // Remove o item da lista
    estoque = estoque.filter(item => item.id !== id);
    salvarEstoque();
    atualizarLista();
  }

  // Inicializar
  carregarEstoque();
});
