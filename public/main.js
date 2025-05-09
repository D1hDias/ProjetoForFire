// Variáveis globais
let mapaClientes = {};
let ignoreNextChange = false;
let quillPreamble;
let quillProject;
let quillObservations;
let quillClarifications;
let quillObject;
let quillBudget;

const textosPadraoPorServico = {
    "CA - CERTIFICADO DE APROVAÇÃO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Obtenção do certificado de aprovação (CA) em até D+30 dias úteis após a conclusão da obra, junto ao CBMERJ;</li>
        <li>Emissão e Declaração de Responsável Técnico para o procedimento assistido do Certificado de Aprovação (DCA) e ART, referentes à instalação dos sistemas e dispositivos preventivos fixos.</li>
    </ul>
    <p><strong>Considerações:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>A Contratada atestará e ficará responsável pela instalação dos sistemas e dispositivos fixos perante o CBMERJ e CREA-RJ;</li>
        <li>Será responsável pelo requerimento padrão "certificado de aprovação" do CBMERJ;</li>
        <li>Protocolará a solicitação de vistoria do CBMERJ e acompanhará a obtenção do certificado;</li>
        <li>A obtenção do CA ocorrerá apenas após todas as exigências do Laudo de Exigências (LE) serem cumpridas.</li>
    </ul>
    <p>O Certificado de Aprovação é o documento que certifica o cumprimento integral das exigências do Laudo de Exigências. Ele permanece válido enquanto as características arquitetônicas da edificação não forem alteradas.</p>
    <p><strong>Obrigações da Contratante:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer cópia do laudo de exigências do projeto aprovado;</li>
        <li>Apresentar declaração do representante legal em papel timbrado, com assinatura;</li>
        <li>Fornecer cópias do contrato social ou estatuto, RGI/contrato de locação, cartão CNPJ e documentos do representante;</li>
        <li>Fornecer cópias das ARTs (central de gás, grupo moto gerador, exaustão, escada, ventilação, SPDA, subestação) válidas por 12 meses;</li>
        <li>Fornecer cópia do plano de emergência e escape com ART;</li>
        <li>Efetuar o pagamento da taxa DAEM CBMERJ para abertura do processo.</li>
    </ul>
    </div>
`,
    "CMI - CASA DE MÁQUINA DE INCÊNDIO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento, instalação e adequação de 4 (quatro) eletrobombas até 20CV para atender ao sistema de Hidrantes e Sprinklers;</li>
        <li>Instalação de 2 (duas) bombas jockey até 3CV para pressurização de linha com vazão e pressão conforme projeto;</li>
        <li>Fornecimento e instalação de 2 (dois) quadros elétricos para automatização dos sistemas de incêndio;</li>
        <li>Montagem do sistema hidráulico com pressostatos, manômetros, tanques pneumáticos e válvulas de retenção;</li>
        <li>Uso de conexões e registros galvanizados padrão BSP com pintura vermelha de segurança;</li>
        <li>Testes finais e pressurização da rede preventiva fixa;</li>
        <li>Não inclui construção civil da casa de bombas, nem instalação da nova RTI (reserva técnica de incêndio);</li>
        <li>Execução conforme informações do projeto aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "EXTINTOR DE INCÊNDIO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>SERVIÇOS DE MANUTENÇÃO E RECARGA DE EXTINTORES DE INCÊNDIO</p>
    <p><strong>Observações:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>As recargas contemplam retestes e trocas de peças necessárias para a manutenção;</li>
        <li>Caso a necessidade de recarga seja superior à quantidade declarada, esta será cobrada à parte conforme valor unitário contratado.</li>
    </ul>
    </div>
`,
    "HIDRANTE URBANO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento de 1 (um) hidrante de coluna tipo urbano conforme especificações do projeto aprovado;</li>
        <li>A Contratante deve solicitar aprovação e instalação da ligação junto à concessionária Iguá Rio ou Águas do Rio;</li>
        <li>Execução conforme projeto aprovado junto ao CBMERJ.</li>
    </ul>
    <p><strong>Nota:</strong></p>
    <p>
        Caso haja isenção pela concessionária quanto à instalação do hidrante urbano por inviabilidade técnica, a Contratada será responsável por solicitar a isenção ao CBMERJ. A Contratante deve reunir documentos e entrar com o processo na concessionária local. Apenas a concessionária pode realizar a instalação do hidrante.
    </p>
    </div>
`,
    "ILUMINAÇÃO DE EMERGÊNCIA": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>ILUMINAÇÃO DE EMERGÊNCIA – BLOCO AUTÔNOMO</p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e fixação de XX blocos autônomos conforme NBR 10898;</li>
        <li>Fluxo luminoso até 300 lumens, lâmpada fluorescente, potência 2 x 11W, tensão 110/220V;</li>
        <li>Ângulo de abertura da luz 63º, altura de instalação de 2,00m, autonomia de 2 horas;</li>
        <li>Execução conforme projeto aprovado junto ao CBMERJ.</li>
    </ul>
    <p><strong>Nota:</strong> A alimentação das baterias deve ser interligada eletricamente à rede da edificação.</p>
    </div>
`,
    "MANGUEIRA DE INCÊNDIO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>SERVIÇOS DE MANUTENÇÃO E TESTE HIDROSTÁTICO DE MANGUEIRAS DE INCÊNDIO</p>
    <p><strong>Observações:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Serviços além da quantidade declarada deverão ser cobrados à parte conforme valor unitário.</li>
    </ul>
    </div>
`,
    "MANUTENÇÃO PREVENTIVA": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>MANUTENÇÃO PREVENTIVA DE SISTEMAS DE PREVENÇÃO E COMBATE A INCÊNDIO</p>
    </div>
`,
    "MANUTENÇÃO PREVENTIVA E CORRETIVA": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>MANUTENÇÃO PREVENTIVA E CORRETIVA DE SISTEMAS DE PREVENÇÃO E COMBATE A INCÊNDIO</p>
    </div>
`,
    "PROJETO DE INCÊNDIO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>ELABORAÇÃO E APROVAÇÃO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Análise das plantas de arquitetura (situação, fachada, cortes, layout) em formato .dwg;</li>
        <li>Elaboração e aprovação do projeto conforme COSCIP e normas técnicas vigentes;</li>
        <li>Dimensionamento e detalhamento dos sistemas preventivos (hidrantes, sprinklers, extintores, detecção de fumaça, SPDA, etc.);</li>
        <li>Entrega do projeto em formato DWG e Memorial Descritivo com Cálculo;</li>
        <li>ART técnica e aprovação junto à DGST/CBMERJ, com emissão de novo Laudo de Exigências.</li>
    </ul>

    <p><strong>Prazos previstos:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Elaboração do projeto: até 40 dias úteis após confirmação do pedido;</li>
        <li>Aprovação junto ao CBMERJ: cerca de 90 dias úteis após protocolo;</li>
        <li>Prazo total estimado: até 100 dias úteis.</li>
    </ul>

    <p><strong><u>Obrigações da Contratante para o Projeto:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer plantas em .dwg (situação, fachada, cortes, layout);</li>
        <li>Cópia do contrato de locação ou RGI do imóvel;</li>
        <li>Cópia do contrato social e do cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e procuração, se aplicável;</li>
        <li>Cópia do LE e CA do condomínio (se for agrupamento comercial);</li>
        <li>Efetuar pagamento da taxa DAEM conforme metragem da área construída (UFIR RJ);</li>
        <li>Confirmar existência de inflamáveis e fornecer dados (tipo, volume);</li>
        <li><u>* Em caso de uso de gás ou exaustão mecânica, fornecer projeto executivo com detalhamento;</u></li>
        <li><u>* Se localizado em shopping/centro comercial, fornecer cópia do LE e CA da edificação principal;</u></li>
        <li><strong>Nota:</strong> A falta de projetos complementares poderá resultar no indeferimento do processo pelo CBMERJ.</li>
    </ul>
    </div>
`,
    "PROJETO DE INCÊNDIO + LEV ARQ": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>ELABORAÇÃO E APROVAÇÃO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO COM LEVANTAMENTO ARQUITETÔNICO</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Realização de levantamento arquitetônico (situação, fachada, cortes);</li>
        <li>Elaboração e aprovação de projeto conforme COSCIP e normas técnicas vigentes;</li>
        <li>Dimensionamento e detalhamento de sistemas: hidrantes, sprinklers, extintores, sinalização, detecção, SPDA;</li>
        <li>Entrega de projeto em formato DWG e memoriais descritivo e de cálculo;</li>
        <li>Aprovação junto à DGST/CBMERJ e emissão de novo Laudo de Exigências;</li>
        <li>ART técnica da responsabilidade pelo projeto;</li>
        <li>Prazo de elaboração: até 40 dias úteis após confirmação e envio da documentação;</li>
        <li>Prazo estimado de aprovação pelo CBMERJ: até 90 dias úteis após protocolo;</li>
        <li>Prazo total estimado: até 100 dias úteis.</li>
    </ul>

    <p><strong><u>Obrigações da Contratante:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer contrato de locação ou RGI do imóvel;</li>
        <li>Fornecer cópia do contrato social e cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e procuração, se necessário;</li>
        <li>Cópia do LE e CA do condomínio (quando aplicável);</li>
        <li>Efetuar o pagamento da taxa DAEM proporcional à área construída;</li>
        <li>Informar existência de inflamáveis e seus volumes;</li>
        <li><u>* Em caso de uso de gás ou exaustão mecânica, fornecer projeto executivo completo com dados técnicos;</u></li>
        <li><u>* Para imóveis em centros comerciais, fornecer projeto de incêndio aprovado, LE e CA da edificação principal;</u></li>
        <li><strong>Nota:</strong> A ausência dos projetos complementares poderá causar o indeferimento do processo pelo CBMERJ.</li>
    </ul>
    </div>
`,
    "PROJETO DE INCÊNDIO ATUALIZAÇÃO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>ELABORAÇÃO E NOVA APROVAÇÃO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO – ATUALIZAÇÃO</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Análise do projeto de incêndio já aprovado (LE) e das novas plantas arquitetônicas atualizadas (.dwg);</li>
        <li>Atualização e nova aprovação do projeto conforme COSCIP e normas técnicas vigentes;</li>
        <li>Dimensionamento e detalhamento dos sistemas: hidrantes, sprinklers, extintores, sinalização, detecção, SPDA;</li>
        <li>Fornecimento do projeto atualizado em formato DWG, memorial descritivo e memorial de cálculo;</li>
        <li>Aprovação junto à DGST/CBMERJ e emissão de novo Laudo de Exigências;</li>
        <li>ART técnica da atualização do projeto;</li>
        <li>Prazo de elaboração: até 40 dias úteis após confirmação do pedido e recebimento da documentação;</li>
        <li>Prazo estimado de aprovação pelo CBMERJ: até 90 dias úteis após protocolo;</li>
        <li>Prazo total estimado: até 100 dias úteis.</li>
    </ul>

    <p><strong><u>Obrigações da Contratante:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer cópia digital e física do projeto de incêndio aprovado anteriormente (com chancela);</li>
        <li>Fornecer as plantas arquitetônicas atualizadas (situação, fachada, cortes e layout);</li>
        <li>Cópia do contrato de locação ou RGI do imóvel;</li>
        <li>Cópia do contrato social e cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e procuração, se aplicável;</li>
        <li>Cópia do LE e CA do condomínio (quando aplicável);</li>
        <li>Efetuar pagamento da taxa DAEM proporcional à área construída (ATC);</li>
        <li>Informar a existência e características de inflamáveis, se houver;</li>
        <li><u>* Em caso de uso de gás ou exaustão mecânica, fornecer projeto executivo com informações e dimensionamento;</u></li>
        <li><u>* Para imóveis em agrupamentos comerciais, fornecer projeto aprovado, LE e CA da edificação principal;</u></li>
        <li><strong>Nota:</strong> A falta de projetos complementares poderá causar o indeferimento do processo de atualização pelo CBMERJ.</li>
    </ul>
    </div>
`,
    "PROJETO EXECUTIVO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>ELABORAÇÃO DE PROJETO EXECUTIVO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO – AS BUILT</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Levantamento técnico em campo das instalações da rede preventiva fixa de incêndio;</li>
        <li>Digitalização das plantas físicas existentes para conversão em formato eletrônico;</li>
        <li>Verificação e análise das documentações e layout arquitetônico atualizado;</li>
        <li>Elaboração do desenho técnico do sistema de incêndio existente (planta baixa e cortes);</li>
        <li>Projeto compatibilizado com a edificação conforme normas vigentes (COSCIP, ABNT);</li>
        <li>Entrega do projeto em formato DWG e PDF com toda a representação gráfica necessária;</li>
        <li>Prazo estimado de execução: até 30 dias úteis após confirmação e entrega da documentação.</li>
    </ul>

    <p><strong><u>Obrigações da Contratante:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer o projeto de incêndio atual (aprovado) e plantas arquitetônicas futuras em DWG;</li>
        <li>Garantir o acesso aos ambientes e áreas técnicas durante o levantamento em campo.</li>
    </ul>

    <p><strong>Nota:</strong> Durante o período de elaboração, a FORFIRE não se responsabiliza por notificações ou autuações emitidas pelo CBMERJ, nem por multas relacionadas à edificação.</p>
    </div>
`,
    "PROPOSTA TÉCNICA DE CONTRATO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>PROPOSTA TÉCNICA DE CONTRATO DE MANUTENÇÃO PREVENTIVA DE INCÊNDIO</p>
    </div>
`,
    "REDE DE HIDRANTES": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Instalação da rede preventiva com 11 hidrantes simples, tubulação de aço carbono DIN 2440 CL10 de 2.1/2";</li>
        <li>Instalação de 5 caixas de incêndio 0,70 x 0,50 x 0,25 e registros globo 2 ½";</li>
        <li>Instalação de 10 mangueiras tipo II, 1.1/2" de 15 metros conforme NBR 11861;</li>
        <li>Instalação de 5 adaptadores storz, 5 chaves storz, 5 esguichos reguláveis, 5 tampões storz;</li>
        <li>Instalação de conexões e materiais de fixação conforme NBRs aplicáveis;</li>
        <li>Execução conforme projeto aprovado pelo CBMERJ.</li>
    </ul>
    </div>
`,
    "SAI": `<div style="text-align: justify; font-size: 12px; line-height: 1.4;">
  <p><strong>SAI – SISTEMA DE ALARME DE INCÊNDIO</strong></p>
  <ul style="margin: 0; padding-left: 20px;">
    <li>Fornecimento e instalação de XX dispositivos do sistema de alarme de incêndio, distribuídos conforme abaixo:</li>
    <li>XX centrais de alarme;</li>
    <li>Até XX acionadores manuais com carcaça plástica vermelha, 24VCC;</li>
    <li>Até XX alertadores sonoros e visuais (sirenes eletrônicas com estrobo);</li>
    <li>Fornecimento de infraestrutura seca:</li>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Conduletes de alumínio 4"x4";</li>
      <li>Resistência de fim de linha (47Ω);</li>
      <li>Eletrodutos de aço galvanizado;</li>
      <li>Fiação AF control 2x1,5mm² blindado com malha e dreno (indicação de laço);</li>
      <li>Fiação dos alertadores 2x2,5mm².</li>
    </ul>
    <li>Teste operacional completo da central de alarme;</li>
    <li>Execução conforme projeto aprovado junto ao CBMERJ.</li>
  </ul>
</div>
`,
    "SDAI": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>SDAI – SISTEMA DE DETECÇÃO E ALARME DE INCÊNDIO</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação de XX dispositivos do sistema de detecção e alarme, incluindo:</li>
        <li>XX centrais de alarme;</li>
        <li>XX detectores ópticos de fumaça;</li>
        <li>XX detectores de temperatura termovelocimétrico;</li>
        <li>XX detectores térmicos;</li>
        <li>XX acionadores manuais com carcaça plástica vermelha, 24VCC;</li>
        <li>XX alertadores sonoros e visuais (sirene eletrônica com estrobo);</li>
        <li>Infraestrutura completa do sistema:</li>
        <ul style="margin: 0; padding-left: 20px;">
        <li>Conduletes de alumínio 4"x4";</li>
        <li>Resistência de fim de linha (47Ω);</li>
        <li>Eletrodutos de aço galvanizado esmaltado antichama 3/4";</li>
        <li>Fiação AF control 2x1,5mm² blindada com malha e dreno (identificação de laço);</li>
        <li>Fiação dos alertadores: 2x2,5mm².</li>
        </ul>
        <li>Teste operacional completo da central de alarme;</li>
        <li>Execução conforme projeto aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "SINALIZAÇÃO": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>SINALIZAÇÃO DE EMERGÊNCIA E ORIENTAÇÃO</p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação de XX sinalizações fotoluminescentes conforme NBR 13434-1/2/3;</li>
        <li>Materiais antichama e anti-propagação aplicados em toda edificação;</li>
        <li>Execução conforme projeto aprovado pelo CBMERJ.</li>
    </ul>
    </div>
`,
    "SPRINKLERS": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>REDE DE SPRINKLERS</p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Instalação de rede com tubulação aço carbono DIN 2440 CL150 1" a X", soldada e pintada;</li>
        <li>Instalação de XX sprinklers pendentes de 68°C tipo K80 com canoplas;</li>
        <li>Instalação de conexões, válvulas, registros por pavimento e base de sustentação;</li>
        <li>Envelopamento, pintura e testes da rede de incêndio;</li>
        <li>Execução conforme projeto aprovado pelo CBMERJ.</li>
    </ul>
    </div>
`,
    "VENDA DE MATERIAIS E EQUIPAMENTOS": `
    <div style="text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>VENDA DE COMPONENTES DE PREVENÇÃO E COMBATE A INCÊNDIO</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Comercialização de extintores, mangueiras, sinalizações fotoluminescentes, suportes e acessórios;</li>
        <li>Venda de equipamentos conforme normas técnicas vigentes e necessidades específicas do cliente;</li>
        <li>Todos os itens fornecidos com certificação, quando aplicável, e garantia técnica;</li>
        <li>Entrega mediante agendamento, com emissão de nota fiscal;</li>
        <li>Itens sujeitos à disponibilidade em estoque e prazo de entrega conforme condições comerciais acordadas.</li>
    </ul>
    </div>
`,
  };

// Carregamento de clientes do Excel
async function carregarClientesDeExcel() {
    try {
        const response = await fetch('clientes.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const select = document.getElementById('client-select');
        select.innerHTML = '<option value="">Selecionar cliente...</option>';

        mapaClientes = {}; // reset

        jsonData.forEach(row => {
            if (row.Cliente) {
                mapaClientes[row.Cliente] = {
                    endereco: row.Endereço || '',
                    cnpj: row.CNPJ || '',
                };

                const option = document.createElement('option');
                option.value = row.Cliente;
                option.textContent = row.Cliente;
                select.appendChild(option);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar clientes.xlsx:", error);
    }
}

// Event listener para seleção de cliente
document.getElementById('client-select').addEventListener('change', function () {
    const selectedClient = this.value;
    const clientData = mapaClientes[selectedClient] || {};

    // Preenche campos ocultos ou visíveis
    document.getElementById('client-name').value = selectedClient;
    document.getElementById('location-name').value = selectedClient;
    document.getElementById('location-address').value = clientData.endereco || '';
    document.getElementById('client-contact').value = ''; // contato ainda é manual
});

// Event listener para botão de adicionar cliente
document.getElementById('add-client-btn').addEventListener('click', function() {
    document.getElementById('client-select-container').style.display = 'none';
    document.getElementById('custom-client-container').style.display = 'block';
});

// Event listener para botão de adicionar cliente
document.getElementById('add-client-btn').addEventListener('click', function() {
    document.getElementById('client-select-container').style.display = 'none';
    document.getElementById('custom-client-container').style.display = 'block';
    // Limpa qualquer seleção anterior
    document.getElementById('client-select').value = '';
});

// Event listener para botão de adicionar cliente
document.getElementById('add-client-btn').addEventListener('click', function() {
    // Esconde completamente o select e mostra apenas o campo de texto
    document.getElementById('client-select').style.display = 'none';
    document.getElementById('add-client-btn').style.display = 'none';
    document.getElementById('custom-client-container').style.display = 'block';
});

// Adicionar um event listener para o botão client-ok-button
const originalClientOkButton = document.getElementById('client-ok-button');
const originalClickHandler = originalClientOkButton.onclick;

originalClientOkButton.onclick = function() {
    const customClientContainer = document.getElementById('custom-client-container');
    
    if (customClientContainer.style.display === 'block') {
        // Cliente personalizado
        const clientName = document.getElementById('custom-client-name').value.trim();
        const clientContact = document.getElementById('client-contact').value;
        
        if (!clientName) {
            alert('Por favor, insira o nome do cliente.');
            return;
        }
        
        // Preencher campos
        document.getElementById('client-name').value = clientName;
        document.getElementById('location-name').value = clientName;
        document.getElementById('location-address').value = ''; // Deixar endereço em branco
        
        // Atualizar visualização do cliente na proposta
        const clientInfoHTML = `
            <div>À</div>
            <div>${clientName}</div>
            <div>A/C ${clientContact}</div>
        `;
        
        document.querySelector('.client-info').innerHTML = clientInfoHTML;
        updatePreview();
        
        // Restaurar visualização original após OK
        document.getElementById('custom-client-container').style.display = 'none';
        document.getElementById('client-select-container').style.display = 'flex';
        document.getElementById('custom-client-name').value = '';
        
    } else if (document.getElementById('client-select').value) {
        // Se um cliente foi selecionado da lista, use o comportamento original
        if (typeof originalClickHandler === 'function') {
            originalClickHandler.call(this);
        } else {
            // Implementação padrão caso o handler original não exista
            const selectedClient = document.getElementById('client-select').value;
            const clientData = mapaClientes[selectedClient] || {};
            const clientContact = document.getElementById('client-contact').value;
            
            document.getElementById('client-name').value = selectedClient;
            document.getElementById('location-name').value = selectedClient;
            document.getElementById('location-address').value = clientData.endereco || '';
            
            const clientInfoHTML = `
                <div>À</div>
                <div>${selectedClient}</div>
                <div>A/C ${clientContact}</div>
            `;
            
            document.querySelector('.client-info').innerHTML = clientInfoHTML;
            updatePreview();
        }
    } else {
        alert('Por favor, selecione um cliente ou adicione um novo.');
    }
};
  

// Inicialização do aplicativo
document.addEventListener('DOMContentLoaded', function () {

    const savedProposalsModal = new bootstrap.Modal(document.getElementById('savedProposalsModal'));

    document.getElementById('open-saved-proposals').addEventListener('click', () => {
        const listContainer = document.getElementById('saved-proposals-list');
        listContainer.innerHTML = '';
    
        const chaves = Object.keys(localStorage).filter(k => k.startsWith('ff_proposta_'));
    
        if (chaves.length === 0) {
            listContainer.innerHTML = '<li class="list-group-item text-muted">Nenhuma proposta salva.</li>';
            savedProposalsModal.show();
            return;
        }
    
        chaves.forEach(chave => {
            const dados = JSON.parse(localStorage.getItem(chave));
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-start flex-wrap';
    
            item.innerHTML = `
            <div class="d-flex align-items-center">
                <input class="form-check-input me-2 select-proposal" type="checkbox" value="${dados.numero}">
                <div>
                    <div><strong>${dados.numero}</strong> - ${dados.tipo}</div>
                    <div class="text-muted">${dados.referencia || '(Sem referência)'}</div>
                </div>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary me-1" data-load="${dados.numero}">Carregar</button>
                <button class="btn btn-sm btn-outline-danger" data-delete="${dados.numero}">Excluir</button>
            </div>
            `;
    
            listContainer.appendChild(item);
        });
    
        savedProposalsModal.show();
    });
    
    // Event delegation para carregar ou excluir proposta
    document.getElementById('saved-proposals-list').addEventListener('click', function (e) {
        if (e.target.dataset.load) {
            const key = `ff_proposta_${e.target.dataset.load}`;
            const dados = JSON.parse(localStorage.getItem(key));
            if (dados) carregarProposta(dados);
            savedProposalsModal.hide();
        }
    
        if (e.target.dataset.delete) {
            const key = `ff_proposta_${e.target.dataset.delete}`;
            if (confirm('Deseja realmente excluir esta proposta?')) {
                localStorage.removeItem(key);
                e.target.closest('li').remove();
            }
        }
    });

    // --- Exclusão múltipla -------------------------------------------------
    const deleteBtn = document.getElementById('delete-selected');
    const list = document.getElementById('saved-proposals-list');

    // Habilita / desabilita o botão conforme seleção
    list.addEventListener('change', (e) => {
        if (e.target.classList.contains('select-proposal')) {
            const algumaSelecionada = list.querySelectorAll('.select-proposal:checked').length > 0;
            deleteBtn.disabled = !algumaSelecionada;
        }
    });

    // Exclui todas as selecionadas
    deleteBtn.addEventListener('click', () => {
        const selecionadas = list.querySelectorAll('.select-proposal:checked');
        if (selecionadas.length === 0) return;

        if (!confirm(`Deseja realmente excluir ${selecionadas.length} proposta(s)?`)) return;

        selecionadas.forEach(cb => {
            const numero = cb.value;
            localStorage.removeItem(`ff_proposta_${numero}`);
            cb.closest('li').remove();
        });

        // Desabilita o botão novamente
        deleteBtn.disabled = true;

        // Se não restar nenhuma proposta, mostra mensagem padrão
        if (list.children.length === 0) {
            list.innerHTML = '<li class="list-group-item text-muted">Nenhuma proposta salva.</li>';
        }
    });


    // Função para verificar se a proposta está em branco
    function isProposalBlank() {
        const ref = document.getElementById('proposal-reference').value.trim();
        const client = document.getElementById('client-select').value.trim();
        const clientContact = document.getElementById('client-contact').value.trim();
        const preambulo = document.getElementById('preambleDescription').value.trim();
        const objeto = document.getElementById('objectDescription').value.trim();
        const observacoes = document.getElementById('observationsDescription').value.trim();
        const esclarecimentos = document.getElementById('clarificationsDescription').value.trim();
        const projectChecked = Array.from(document.querySelectorAll('.project-option')).some(cb => cb.checked);
    
        return ref === '' && client === '' && clientContact === '' &&
            preambulo === '' && objeto === '' && observacoes === '' && 
            esclarecimentos === '' && !projectChecked;
    }

    // Função para salvar a proposta atual
    function saveCurrentProposal() {
        const propostaId = document.getElementById('proposal-number').value;
        const proposta = {
            numero: propostaId,
            tipo: document.getElementById('proposal-type').value,
            empresa: document.getElementById('company-selector').value,
            referencia: document.getElementById('proposal-reference').value,
            cliente: document.getElementById('client-select').value,
            contato: document.getElementById('client-contact').value,
            preambulo: document.getElementById('preambleDescription').value,
            objeto: document.getElementById('objectDescription').value,
            observacoes: document.getElementById('observationsDescription').value,
            esclarecimentos: document.getElementById('clarificationsDescription').value,
            orcamento: document.getElementById('budgetDescription').value, // Adicionado
            servicos: [...document.querySelectorAll('.project-option')].map(cb => ({
                id: cb.id,
                checked: cb.checked,
                descricao: cb.dataset.description || ''
            })),
            dataSalva: new Date().toISOString()
        };
    
        localStorage.setItem(`ff_proposta_${propostaId}`, JSON.stringify(proposta));
    }

    // Função para resetar os campos da proposta
    function resetProposal() {
        document.getElementById('proposal-reference').value = '';
        document.getElementById('client-select').value = '';
        document.getElementById('client-contact').value = '';
        document.getElementById('preambleDescription').value = '';
        document.getElementById('objectDescription').value = '';
        document.getElementById('observationsDescription').value = '';
        document.getElementById('clarificationsDescription').value = '';
        document.getElementById('budgetDescription').value = ''; // Adicionado
    
        // Opcional: Resetar selects para valores padrão
        document.getElementById('company-selector').value = 'forfire1';
        document.getElementById('proposal-type').value = 'Proposta Comercial';
    
        // Desmarcar checkboxes de serviços e remover atributos de descrição e estilos
        document.querySelectorAll('.project-option').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
            delete cb.dataset.description;
            const label = cb.closest('.form-check').querySelector('label');
            label.style.fontWeight = 'normal';
            label.querySelectorAll('.edit-btn').forEach(btn => btn.remove());
        });
    
        // Atualizar visualização após reset
        updatePreview();
    }

    // Função para exibir mensagem "Proposta atualizada!" abaixo de um campo
    function showUpdateMessage(field) {
        // Procura uma mensagem já existente e remove, se houver
        let parent = field.parentElement;
        const existingMsg = parent.querySelector('.update-msg');
        if (existingMsg) existingMsg.remove();
    
        const msg = document.createElement('div');
        msg.textContent = "Proposta atualizada!";
        msg.style.color = 'lime';
        msg.style.fontSize = '0.8em';
        msg.className = 'update-msg';
        parent.appendChild(msg);
    
        setTimeout(() => {
            msg.remove();
        }, 2000);
    }

    // Função auxiliar para anexar listeners de atualização a um campo
    function attachUpdateMessage(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.addEventListener('change', () => showUpdateMessage(field));
        field.addEventListener('blur', () => showUpdateMessage(field));
    }

    // Anexa o listener para os campos desejados (pode-se aumentar conforme necessário)
    ['proposal-reference', 'client-contact', 'company-selector', 'proposal-type'].forEach(id => {
        attachUpdateMessage(id);
    });

    // Listener para o botão "NOVA PROPOSTA"
    document.getElementById('nova-proposta').addEventListener('click', function() {
        if (isProposalBlank()) {
            alert("Você ainda não iniciou o preenchimento de uma proposta.");
        } else {
            if (confirm("Deseja criar uma nova proposta? Se precisar voltar nesta proposta, acesse MINHAS PROPOSTAS no meu.")) {
                // Salva os dados atuais da proposta
                saveCurrentProposal();
                // Reseta os campos para o estado inicial
                resetProposal();
            }
        }
    });

    // Listener para o botão "LIMPAR"
    document.getElementById('limpar-proposta').addEventListener('click', function(){
        if (confirm("Deseja realmente limpar a proposta?")) {
            // Chama a função de reset, mantendo o mesmo número de proposta
            resetProposal();
        }
        // Se o usuário escolher "NÃO", não faz nada.
    });
    
    // Função para carregar uma proposta no formulário
    function carregarProposta(dados) {
        document.getElementById('proposal-number').value = dados.numero;
        document.getElementById('proposal-type').value = dados.tipo;
        document.getElementById('company-selector').value = dados.empresa;
        document.getElementById('proposal-reference').value = dados.referencia;
        document.getElementById('client-select').value = dados.cliente;
        document.getElementById('client-contact').value = dados.contato;
        document.getElementById('preambleDescription').value = dados.preambulo;
        document.getElementById('objectDescription').value = dados.objeto;
        document.getElementById('observationsDescription').value = dados.observacoes;
        document.getElementById('clarificationsDescription').value = dados.esclarecimentos;
        document.getElementById('budgetDescription').value = dados.orcamento || ''; // Adicionado
    
        // Reaplicar serviços
        document.querySelectorAll('.project-option').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
            delete cb.dataset.description;
            const label = cb.closest('.form-check').querySelector('label');
            label.style.fontWeight = 'normal';
            label.querySelectorAll('.edit-btn').forEach(btn => btn.remove());
        });
    
        dados.servicos.forEach(servico => {
            const cb = document.getElementById(servico.id);
            if (cb) {
                cb.checked = servico.checked;
                cb.dataset.description = servico.descricao;
    
                if (servico.checked) {
                    cb.disabled = true;
                    const label = cb.closest('.form-check').querySelector('label');
                    label.style.fontWeight = 'bold';
    
                    // Botão editar
                    const editBtn = document.createElement('button');
                    editBtn.textContent = '✎';
                    editBtn.className = 'btn btn-sm btn-outline-secondary edit-btn ms-2';
                    editBtn.title = 'Editar';
                    editBtn.addEventListener('click', () => {
                        document.getElementById('currentProjectId').value = cb.id;
                        quillProject.root.innerHTML = cb.dataset.description || '';
                        bootstrap.Modal.getOrCreateInstance(document.getElementById('projectDescriptionModal')).show();
                    });
                    label.appendChild(editBtn);
                }
            }
        });
    
        companySelector.dispatchEvent(new Event('change'));
        updatePreview();
    }    

    // Carregar clientes
    carregarClientesDeExcel();

    let currentProposalNumber = parseInt(localStorage.getItem('ff_proposal_number') || '1', 10);
    
    function updateProposalNumber() {
        const currentYear = new Date().getFullYear();
        const formattedProposal = `FF-${String(currentProposalNumber).padStart(2, '0')}-${currentYear}`;
        const proposalField = document.getElementById('proposal-number');
        proposalField.value = formattedProposal;
        proposalField.style.backgroundColor = "#eee"; // Campo em readonly inicia com fundo cinza
    }
    
    
    updateProposalNumber();

    // Listener para o botão de edição do número da proposta
    document.getElementById('toggle-edit-number').addEventListener('click', function() {
        const input = document.getElementById('proposal-number');
        const statusMsg = document.getElementById('proposal-status-msg'); // elemento para exibir a mensagem
        if (input.hasAttribute('readonly')) {
            // Modo edição: remove readonly, fundo branco, limpa mensagem, altera texto do botão para "Salvar"
            input.removeAttribute('readonly');
            input.style.backgroundColor = "#fff";
            statusMsg.innerText = "";
            this.textContent = "Salvar";
        } else {
            // Modo salvo: define o campo como readonly, fundo cinza, atualiza valor e mensagem de status
            input.setAttribute('readonly', true);
            input.style.backgroundColor = "#eee";
            const manualValue = input.value;
            let parts = manualValue.split('-');
            if (parts.length === 3) {
                let num = parseInt(parts[1]);
                if (!isNaN(num)) {
                    currentProposalNumber = num;
                    localStorage.setItem('ff_proposal_number', currentProposalNumber.toString());
                }
            }
            this.textContent = "Editar";
            // Em vez de popup, exibe mensagem em texto verde abaixo do campo
            const proposalValue = input.value;
            if (/^FF-\d{2}-\d{4}$/.test(proposalValue)) {
                statusMsg.innerHTML = `Proposta <strong>${proposalValue}</strong> salva com sucesso!`;
            } else {
                statusMsg.innerHTML = "Formato da proposta inválido! Utilize o padrão FF-xx-xxxx.";
            }
        }
    });    
    

    // Inicialização dos modais
    const preambleModal = new bootstrap.Modal(document.getElementById('preambleModal'));
    const projectDescriptionModal = new bootstrap.Modal(document.getElementById('projectDescriptionModal'));
    const observationsModal = new bootstrap.Modal(document.getElementById('observationsModal'));
    const clarificationsModal = new bootstrap.Modal(document.getElementById('clarificationsModal'));
    const objectModal = new bootstrap.Modal(document.getElementById('objectModal'));

    // CAMPOS SELETOR DAS EMPRESAS
    const companyData = {
        forfire1: {
            nome: "FORFIRE Prevenção de Incêndio",
            endereco: "Av. Embaixador Abelardo Bueno, 3500 – Sala 820 – Ed. Vision Offices<br>Barra da Tijuca / RJ – CEP: 22775-040",
            cnpj: "CNPJ: 23.211.427/0001-34 / Inscrição Estadual: 87.017.290"
        },
        forfire2: {
            nome: "FORFIRE Serviços e Comércio",
            endereco: "Av. Camões, 611<br>Penha Circular / RJ – CEP: 21011-510",
            cnpj: "CNPJ: 18.739.222/0001-96 / Inscrição Estadual: 79.995.681"
        }
    };

    // Configura o seletor de empresa
    const companySelector = document.getElementById('company-selector');
    companySelector.addEventListener('change', function() {
        const selectedCompany = this.value;
        
        // Atualizar elementos do cabeçalho com os dados da empresa selecionada
        if (companyData[selectedCompany]) {
            document.getElementById('preview-company-name').innerHTML = companyData[selectedCompany].nome;
            document.getElementById('preview-company-address').innerHTML = companyData[selectedCompany].endereco;
            document.getElementById('preview-company-cnpj').innerHTML = companyData[selectedCompany].cnpj;
        }
    });
    
    // Inicializa a empresa selecionada
    companySelector.dispatchEvent(new Event('change'));

    // Inicializa os editores Quill
    quillObject = new Quill('#quillObjectEditor', {
        theme: 'snow',
        placeholder: 'Digite o conteúdo do Objeto...',
        modules: {
            toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: [] }],
                ['clean']
            ]
        }
    });

    quillPreamble = new Quill('#quillPreambleEditor', {
        theme: 'snow',
        placeholder: 'Digite o preâmbulo da proposta...',
        modules: {
            toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: [] }],
                ['clean']
            ]
        }
    });

    quillProject = new Quill('#quillProjectEditor', {
        theme: 'snow',
        placeholder: 'Digite a descrição do serviço...',
        modules: {
            toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: [] }],
                ['clean']
            ]
        }
    });

    quillObservations = new Quill('#quillObservationsEditor', {
        theme: 'snow',
        placeholder: 'Digite as observações...',
        modules: {
            toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: [] }],
                ['clean']
            ]
        }
    });
    
    quillClarifications = new Quill('#quillClarificationsEditor', {
        theme: 'snow',
        placeholder: 'Digite os esclarecimentos...',
        modules: {
            toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: [] }],
                ['clean']
            ]
        }
    });

    quillBudget = new Quill('#quillBudgetEditor', {
        theme: 'snow',
        placeholder: 'Digite o texto do orçamento...',
        modules: {
            toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: [] }],
                ['clean']
            ]
        }
    });
    
    // Adicione o event listener para o botão de edição do orçamento
    document.getElementById('edit-budget').addEventListener('click', () => {
        const defaultHtml = `Para fornecimento dos serviços, equipamentos e materiais acima descritos, juntamente com a mão de obra especializada, dar-se a importância des R$ [VALOR], conforme descrito neste documento, com todos os impostos e encargos inclusos.`;
        const savedHtml = document.getElementById('budgetDescription').value;
    
        quillBudget.setText('');
        quillBudget.clipboard.dangerouslyPasteHTML(savedHtml.trim() ? savedHtml : defaultHtml);
    
        bootstrap.Modal.getOrCreateInstance(document.getElementById('budgetModal')).show();
        setTimeout(() => {
            const length = quillBudget.getLength();
            quillBudget.setSelection(length, 0);
        }, 300);
    });

    // Adicione o event listener para o botão de confirmar o orçamento
    document.getElementById('confirmBudget').addEventListener('click', () => {
        const html = quillBudget.root.innerHTML;
        document.getElementById('budgetDescription').value = html;
        updatePreview();
        
        // Verifique se esta linha está fechando corretamente o modal
        bootstrap.Modal.getOrCreateInstance(document.getElementById('budgetModal')).hide();
    });

    // Editar Preâmbulo
    document.getElementById('edit-preamble').addEventListener('click', () => {
        const defaultHtml = `<p>A FORFIRE vem apresentar sua proposta de serviços [DESCREVER], descritos no corpo desta, em
        conformidade com COSCIP (Código de Segurança contra Incêndio e Pânico - CBMERJ), normas técnicas e 
        legislação brasileira.</p><b>Após análise foi constatada a necessidade dos seguintes serviços:</b>`;
        const savedHtml = document.getElementById('preambleDescription').value;
    
        quillPreamble.setText('');
        quillPreamble.clipboard.dangerouslyPasteHTML(savedHtml.trim() ? savedHtml : defaultHtml);
    
        preambleModal.show();
        setTimeout(() => {
            const length = quillPreamble.getLength();
            quillPreamble.setSelection(length, 0);
        }, 300);        
    });
    
    document.getElementById('confirmPreamble').addEventListener('click', () => {
        const html = quillPreamble.root.innerHTML.trim();
    
        // Salva no campo oculto
        document.getElementById('preambleDescription').value = html;
    
        window.hasUpdatedOnce = true;
        updatePreview();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('preambleModal')).hide();
    });
    
    // Checkbox dos projetos
    document.querySelectorAll('.project-option').forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
            if (ignoreNextChange) {
                ignoreNextChange = false;
                return;
            }

            if (this.checked) {
                const label = this.parentElement.querySelector('label');
                document.getElementById('currentProjectId').value = this.id;
                label.style.fontWeight = 'bold';

                const nomeServico = this.value.trim();
                const html = this.dataset.description || '';
                const textoPadrao = textosPadraoPorServico[nomeServico] || html;
                
                quillProject.setText('');
                quillProject.clipboard.dangerouslyPasteHTML(textoPadrao);
                
                projectDescriptionModal.show();
                setTimeout(() => {
                    const length = quillProject.getLength();
                    quillProject.setSelection(length, 0);
                }, 300);
            }
        });
    });

    // Confirmar descrição do projeto
    document.getElementById('confirmProjectDescription').addEventListener('click', function () {
        const currentProjectId = document.getElementById('currentProjectId').value;
        const checkbox = document.getElementById(currentProjectId);
        const label = checkbox.closest('.form-check').querySelector('.form-check-label');
        const description = quillProject.root.innerHTML.trim().replace(/<(.|\n)*?>/g, '').trim();
    
        if (description.length === 0) {
            checkbox.checked = false;
            checkbox.disabled = false;
            delete checkbox.dataset.description;
            label.style.fontWeight = 'normal';
            label.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.remove());
            quillProject.root.innerHTML = '';
            updatePreview();
            projectDescriptionModal.hide();
            return;
        }
    
        checkbox.dataset.description = quillProject.root.innerHTML.trim();
        label.style.fontWeight = 'bold';
        checkbox.checked = true;
        checkbox.disabled = true;
    
        // Remove botões existentes (caso o usuário já os tenha inserido)
        label.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.remove());
    
        // Criar botão de editar (lápis)
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'btn btn-sm btn-outline-secondary edit-btn ms-2';
        editBtn.title = 'Editar';
        editBtn.addEventListener('click', () => {
            document.getElementById('currentProjectId').value = checkbox.id;
            quillProject.root.innerHTML = checkbox.dataset.description || '';
            projectDescriptionModal.show();
        });
        label.appendChild(editBtn);
    
        // Criar o badge de deletar (X)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'btn btn-sm btn-danger delete-btn ms-1';
        deleteBtn.title = 'Excluir este item';
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Cancela o item: desmarca o checkbox, remove a descrição e volta o label à formatação normal
            checkbox.checked = false;
            checkbox.disabled = false;
            delete checkbox.dataset.description;
            label.style.fontWeight = 'normal';
            // Remove ambos os botões de editar e deletar
            editBtn.remove();
            deleteBtn.remove();
            updatePreview();
        });
        label.appendChild(deleteBtn);
    
        updatePreview();
        projectDescriptionModal.hide();
    });
    

    // Modal fechado sem salvar
    const modal = document.getElementById('projectDescriptionModal');
    modal.addEventListener('hidden.bs.modal', function () {
        const projectId = document.getElementById('currentProjectId').value;
        const checkbox = document.getElementById(projectId);

        if (checkbox && checkbox.checked && !checkbox.dataset.description) {
            checkbox.checked = false;
            checkbox.disabled = false;

            const label = checkbox.closest('.form-check').querySelector('.form-check-label');
            label.style.fontWeight = 'normal';
        }
    });

    // Botão OK da proposta
    document.getElementById('proposal-ok-button').addEventListener('click', function () {
        // Atualiza o cabeçalho com tipo de proposta e número
        updateProposalHeader();
        
        // Atualiza a seção de referência
        updateReferenceSection();
        
        // Atualiza visualização completa
        updatePreview();
    });
    
    // Função para atualizar o cabeçalho da proposta
    function updateProposalHeader() {
        const proposalType = document.getElementById('proposal-type').value;
        const proposalNumber = document.getElementById('proposal-number').value;
        document.getElementById('preview-proposal-header').textContent = `${proposalType} ${proposalNumber}`;
    }

    // Adicione o listener para atualizar em tempo real ao alterar o TIPO DE PROPOSTA:
    document.getElementById('proposal-type').addEventListener('change', updateProposalHeader);

    
    // Função para atualizar a seção de referência
    function updateReferenceSection() {
        const refContainer = document.getElementById('reference-section');
        const refSpan = document.getElementById('preview-proposal-reference');
        const refText = document.getElementById('proposal-reference').value.trim();
        
        if (refText.length > 0) {
            // Converte para maiúsculas e adiciona formatação em negrito
            refSpan.innerHTML = `<strong>REFERÊNCIA - ${refText.toUpperCase()}</strong>`;
            refContainer.style.display = 'block';
        } else {
            refSpan.innerHTML = '';
            refContainer.style.display = 'none';
        }
    }

    // Botão OK dos dados do cliente
    document.getElementById('client-ok-button').addEventListener('click', function () {
        const selectedClient = document.getElementById('client-select').value;
    
        if (selectedClient) {
            const clientName = document.getElementById('location-name').value;
            const clientContact = document.getElementById('client-contact').value;
    
            const clientInfoHTML = `
                <div>À</div>
                <div>${clientName}</div>
                <div>A/C ${clientContact}</div>
            `;
    
            document.querySelector('.client-info').innerHTML = clientInfoHTML;
            updatePreview();
        }
    });
    
    // Atualizar visualização da proposta
    function updatePreview() {
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        document.getElementById('preview-proposal-date').textContent = `Rio de Janeiro, ${dataFormatada}`;
    
        const preambleText = document.getElementById('preambleDescription').value;
        const obs = document.getElementById('observationsDescription').value;
        const esc = document.getElementById('clarificationsDescription').value;
        const obj = document.getElementById('objectDescription').value;
    
        // Atualiza o cabeçalho da proposta
        updateProposalHeader();
        
        // Atualiza a seção de referência
        updateReferenceSection();
    
        document.getElementById('proposal-content').classList.remove('hidden');
    
        // Atualiza Preâmbulo
        const previewPreamble = document.getElementById('preview-preamble');
        previewPreamble.innerHTML = '';
        
        if (preambleText.trim()) {
            const tituloPreamble = document.createElement('div');
            tituloPreamble.className = 'section-title';
            tituloPreamble.textContent = '';
            previewPreamble.appendChild(tituloPreamble);
            
            const corpoPreamble = document.createElement('div');
            corpoPreamble.innerHTML = preambleText;
            corpoPreamble.style.textAlign = 'justify';
            previewPreamble.appendChild(corpoPreamble);
        }

        // Atualiza Objeto
        const previewObject = document.getElementById('preview-object');
        previewObject.innerHTML = '';

        if (obj.trim()) {
            const tituloObjeto = document.createElement('div');
            tituloObjeto.className = 'section-title';
            tituloObjeto.textContent = `1. OBJETO - COMPOSIÇÕES DO SISTEMA DE PREVENÇÃO E COMBATE A INCÊNDIO`;
            previewObject.appendChild(tituloObjeto);
        
            const corpoObjeto = document.createElement('div');
            let objComLetras = obj.replace('<ol>', '<ol type="a">');
            objComLetras = objComLetras.replace(
                /<p[^>]*>\s*<strong>(10\.? NORMAS UTILIZADAS)<\/strong>\s*<\/p>/i,
                '<div style="font-weight: bold; margin-bottom: 0;">$1</div>'
            );
  
            objComLetras = objComLetras.replaceAll('<ul>', '<ul style="margin-left: 30px; padding-left: 20px;">');
            objComLetras = objComLetras.replaceAll('<pre>', '').replaceAll('</pre>', '');
            
            corpoObjeto.innerHTML = objComLetras;
            corpoObjeto.style.textAlign = 'justify';
            previewObject.appendChild(corpoObjeto);
        }

        // Atualiza Escopo dos Projetos
        updateProjects();
    
        // Atualiza Observações
        const previewObservations = document.getElementById('preview-observations');
        previewObservations.innerHTML = '';
        
        if (obs.trim()) {
            const tituloObs = document.createElement('div');
            tituloObs.className = 'section-title';
            tituloObs.textContent = 'OBSERVAÇÕES';
            previewObservations.appendChild(tituloObs);
        
            const corpoObs = document.createElement('div');
            corpoObs.innerHTML = obs;
            corpoObs.style.textAlign = 'justify';
            previewObservations.appendChild(corpoObs);
        }
    
        // Atualiza Esclarecimentos
        const previewClarifications = document.getElementById('preview-clarifications');
        previewClarifications.innerHTML = '';
        
        if (esc.trim()) {
            const tituloClarifications = document.createElement('div');
            tituloClarifications.className = 'section-title';
            tituloClarifications.textContent = 'ESCLARECIMENTOS';
            previewClarifications.appendChild(tituloClarifications);
        
            const corpoClarifications = document.createElement('div');
            corpoClarifications.innerHTML = esc;
            corpoClarifications.style.textAlign = 'justify';
            previewClarifications.appendChild(corpoClarifications);
        }
    
        // Valor do Serviço
        const budgetContainer = document.getElementById('budget-section');
        if (!budgetContainer) {
            const newBudgetContainer = document.createElement('div');
            newBudgetContainer.id = 'budget-section';
            document.getElementById('preview-projects-wrapper').after(newBudgetContainer);
        }
        const budgetText = document.getElementById('budgetDescription').value;
        
        if (budgetText.trim()) {
            document.getElementById('budget-section').innerHTML = `
                <p class="section-title">VALOR TOTAL DOS SERVIÇOS</p>
                <p>${budgetText}</p>
            `;
            document.getElementById('budget-section').style.display = 'block';
        } else {
            document.getElementById('budget-section').style.display = 'none';
        }
    }

    // Função para atualizar os projetos
    function updateProjects() {
        const projectsWrapper = document.getElementById('preview-projects-wrapper');
        projectsWrapper.innerHTML = '';
    
        const selectedProjects = document.querySelectorAll('.project-option:checked');
        if (selectedProjects.length > 0) {
            // Adiciona o título geral da seção de projetos
            const tituloEscopo = document.createElement('div');
            tituloEscopo.className = 'section-title';
            tituloEscopo.textContent = '2. ESCOPO DESTA PROPOSTA - SOLUÇÕES TÉCNICAS GLOBAIS';
            projectsWrapper.appendChild(tituloEscopo);
    
            selectedProjects.forEach((project, index) => {
                // Cria um container único para cada serviço
                const wrapper = document.createElement('div');
                wrapper.className = 'proposal-item-wrapper';
                wrapper.style.breakInside = 'auto';
                wrapper.style.pageBreakInside = 'auto';
    
                // Cria o título do serviço
                const titulo = document.createElement('div');
                titulo.className = 'proposal-item';
                const letra = String.fromCharCode(97 + index); // 97 = "a"
                titulo.textContent = `${letra}. ${project.value}`;
                wrapper.appendChild(titulo);
    
                // Se houver descrição, cria o elemento de conteúdo
                if (project.dataset.description) {
                    const desc = document.createElement('div');
                    desc.className = 'proposal-item-description';
                    let enhancedDescription = preserveListSymbols(project.dataset.description);
                    enhancedDescription = enhancedDescription.replace(/([•✓]) (.*?)(?=<br>|$)/g, '<li>$2</li>');
                    if (enhancedDescription.includes('<li>')) {
                        enhancedDescription = `<ul class="special-markers" style="margin: 0; padding-left: 20px;">${enhancedDescription}</ul>`;
                    }
                    desc.innerHTML = enhancedDescription;
                    desc.style.textAlign = 'justify';
                    wrapper.appendChild(desc);
                }

                projectsWrapper.appendChild(wrapper);
            });
        }


        function salvarPropostaLocalmente() {
            const propostaId = document.getElementById('proposal-number').value;
            const proposta = {
                numero: propostaId,
                tipo: document.getElementById('proposal-type').value,
                empresa: document.getElementById('company-selector').value,
                referencia: document.getElementById('proposal-reference').value,
                cliente: document.getElementById('client-select').value,
                contato: document.getElementById('client-contact').value,
                preambulo: document.getElementById('preambleDescription').value,
                objeto: document.getElementById('objectDescription').value,
                observacoes: document.getElementById('observationsDescription').value,
                esclarecimentos: document.getElementById('clarificationsDescription').value,
                servicos: [...document.querySelectorAll('.project-option')].map(cb => ({
                    id: cb.id,
                    checked: cb.checked,
                    descricao: cb.dataset.description || ''
                })),
                dataSalva: new Date().toISOString()
            };
        
            localStorage.setItem(`ff_proposta_${propostaId}`, JSON.stringify(proposta));
        }
        
        salvarPropostaLocalmente();

    }

    // Preservar símbolos especiais em listas
    function preserveListSymbols(html) {
        // Preserva marcadores de lista do tipo "•", "✓", etc.
        html = html.replace(/• /g, '<span class="list-marker bullet">• </span>');
        html = html.replace(/✓ /g, '<span class="list-marker check">✓ </span>');
        
        // Preserva formatação de listas HTML
        html = html.replace(/<ul>/g, '<ul class="preserved-list">');
        html = html.replace(/<ol>/g, '<ol class="preserved-list">');
        
        return html;
    }

    // Editar Objeto
    document.getElementById('edit-object').addEventListener('click', () => {
        const defaultHtml = `
        <ol>
          <li>Fornecimento, instalação e montagem do sistema de pressurização da casa de máquinas de incêndio (CMI)</li>
          <li>Fornecimento e instalação do sistema de hidrantes (HID)</li>
          <li>Fornecimento e instalação do sistema de sprinklers (SPK)</li>
          <li>Fornecimento e instalação do sistema de detecção de alarme de incêndio (SDAI)</li>
          <li>Fornecimento de extintores de incêndio (EXT)</li>
          <li>Fornecimento e instalação da sinalização e orientação de incêndio (SIN)</li>
          <li>Fornecimento e Fixação de Iluminação de Emergência (ILU)</li>
          <li>Emissão de Anotação de Responsabilidade Técnica (ART)</li>
          <li>Emissão de Anotação de Responsabilidade Técnica da adequação da rede de incêndio e dos controles de materiais de acabamentos e revestimentos que atendem ao previsto na NT-2-20 do CBMERJ – conforme projeto aprovado (ART)</li>
          <li>NORMAS UTILIZADAS</li>
          <ul>
          <li>NBR 13714 Sistemas de Hidrantes e Mangotinhos</li>
          <li>NBR 10897 Sistemas de Proteção por Chuveiros Automáticos</li>
          <li>NBR 12693 Sistemas de Proteção por Extintores de Incêndio</li>
          <li>NBR 13434 Sinalização de Segurança Contra Incêndio e Pânico</li>
          <li>NBR 17240 Sistemas de Detecção e Alarme de Incêndio</li>
          <li>NBR 10898 Sistemas de Iluminação de Emergência</li>
          <li>NBR 5419 Sistema de Proteção de Estruturas Contra Descargas Atmosféricas</li>
          <li>NPFA 72 National Fire Alarm and Signaling Code</li>
          </ul>
        </ol>
        `;        
        const savedHtml = document.getElementById('objectDescription').value;
    
        quillObject.setText('');
        quillObject.clipboard.dangerouslyPasteHTML(savedHtml.trim() ? savedHtml : defaultHtml);
    
        objectModal.show();
        setTimeout(() => {
            const length = quillObject.getLength();
            quillObject.setSelection(length, 0);
        }, 300);
    });

    // Confirmar Objeto
    document.getElementById('confirmObject').addEventListener('click', () => {
        const html = quillObject.root.innerHTML;
        document.getElementById('objectDescription').value = html;
        updatePreview();
        bootstrap.Modal.getInstance(document.getElementById('objectModal')).hide();
    });

    // Editar Observações
    document.getElementById('edit-observations').addEventListener('click', () => {
        const defaultHtml = `
            <ol>
                <li>Escopo elaborado através dos arquivos recebidos (plantas do projeto de incêndio);</li>
                <li>Os materiais e equipamentos da instalação de incêndio serão de responsabilidade da Contratada ou poderão ser faturados diretamente em nome da Contratante com de acordo prévio;</li>
                <li>Será de responsabilidade da Contratante abertura, fechamento de teto, acabamentos e pinturas derivadas das passagens de tubulação e infraestrutura das instalações de incêndio;</li>
                <li>Será de responsabilidade da Contratada a realização de vistoria técnica para elaboração de laudo técnico circunstanciado fotográfico, emitido por profissional legalmente habilitado e qualificado, atestando as condições de operacionalidade e de qualidade técnica de montagem e instalação dos equipamentos e sistemas de segurança contra incêndio e pânico;</li>
                <li>Será de responsabilidade da Contratada a elaboração de Laudo CMAR (controle de materiais e acabamentos e revestimentos) incluindo a análise de todos os materiais de acabamento e revestimentos que são utilizados na estrutura do edifício, de acordo com as especificações de fabricação. Pisos; Paredes e divisórias; Tetos e forros; Coberturas. Conforme Instrução Técnica nº 10, determinante para todos os parâmetros e regras que orientam os profissionais no processo de regularização;</li>
                <li>Será de responsabilidade da Contratada a emissão de declaração de responsável técnico, que consiste em documento emitido por profissional legalmente habilitado e qualificado, que atesta o cumprimento das medidas de segurança contra incêndio e pânico;</li>
                <li>Será de responsabilidade da Contratante a elaboração de plano de emergência contra incêndio e pânico, conforme Nota Técnica do CBMERJ, NT 2-10 – Plano de emergência contra incêndio e pânico (PECIP) com emissão de anotação de responsabilidade técnica e pagamento da respectiva guia;</li>
                <li>Fornecimento do equipamento e componentes do hidrante tipo coluna será de responsabilidade da Contratada, porém, caso seja isento pela Concessionária citada a instalação do hidrante de coluna tipo urbano devido à falta de viabilidade técnica, ficará a cargo da Contratante a solicitação ao CBMERJ da isenção desta exigência aprovada no projeto de incêndio. Fica a cargo da Contratada reunião de documentos e entrada em processo para análise de viabilidade da instalação de hidrante urbano junto a concessionária de águas local. Apenas a concessionária de águas local poderá realizar a instalação do hidrante urbano tipo coluna;</li>
                <li>Faz parte do escopo desta proposta assessoria para obtenção de certificado de aprovação perante respectivamente expedido e aprovado pelo CBMERJ. O Certificado de Aprovação (CA) será emitido pelo CBMERJ que atende a região do imóvel e sua emissão de responsabilidade da Contratada, porém, o mesmo somente será emitido se todas as exigências descritas no LE (laudo de exigências do CBMERJ) forem cumpridas pela Contratante. O Prazo para aprovação do Certificado de Aprovação dependerá do tempo de tramitação do CBMERJ, não sendo este de responsabilidade da Contratada;</li>
                <li>Gerenciamento e acompanhamento das atividades na obra realizado pelo Engenheiro da Contratada;</li>
                <li>O preço proposto considera todos os custos diretos ou indiretos e quaisquer despesas julgadas necessárias e essenciais ao perfeito cumprimento do objeto, incluindo-se todos os impostos; encargos trabalhistas, previdenciários, fiscais, comerciais, seguros e quaisquer outros que incidam direta ou indiretamente na execução dos serviços.</li>
            </ol>
        `;
    
        const savedHtml = document.getElementById('observationsDescription').value;
    
        quillObservations.setText('');
        quillObservations.clipboard.dangerouslyPasteHTML(
            savedHtml.trim()
                ? savedHtml
                : `<div style="text-align: justify;">${defaultHtml}</div>`
        );
        
        observationsModal.show();
        setTimeout(() => {
            const length = quillObservations.getLength();
            quillObservations.setSelection(length, 0);
        }, 300);
    });
    
    // Confirmar Observações
    document.getElementById('confirmObservations').addEventListener('click', () => {
        const html = quillObservations.root.innerHTML;
        document.getElementById('observationsDescription').value = html;
        updatePreview();
        observationsModal.hide();
    });
    
    // Editar Esclarecimentos
    document.getElementById('edit-clarifications').addEventListener('click', () => {
        const defaultHtml = `
            <ol>
                <li>Condições de pagamento: 30% de sinal (mobilização) e saldo conforme medição;</li>
                <li>Prazo de execução: em até D+150 dias a princípio à Execução total dos serviços e de acordo com o cronograma a ser alinhado;</li>
                <li>Prazo de garantia: serviços (12 meses), materiais e equipamentos (06 meses);</li>
                <li>Validade da proposta: 21 dias</li>
            </ol>
        `;
    
        const savedHtml = document.getElementById('clarificationsDescription').value;
    
        quillClarifications.setText('');
        quillClarifications.clipboard.dangerouslyPasteHTML(
            savedHtml.trim()
                ? savedHtml
                : `<div style="text-align: justify;">${defaultHtml}</div>`
        );
    
        clarificationsModal.show();
        setTimeout(() => {
            const length = quillClarifications.getLength();
            quillClarifications.setSelection(length, 0);
        }, 300);
    });
    
    // Confirmar Esclarecimentos
    document.getElementById('confirmClarifications').addEventListener('click', () => {
        const html = quillClarifications.root.innerHTML;
        document.getElementById('clarificationsDescription').value = html;
        updatePreview();
        clarificationsModal.hide();
    });
    
    // Botão Atualizar Visualização
    document.getElementById('update-preview').addEventListener('click', function () {
        window.hasUpdatedOnce = true;
        updatePreview();
    });
    
    // Event listeners para tecla Enter
    ['proposal-reference'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // evita enviar formulário
                document.getElementById('update-preview').click();
            }
        });
    });

    // Função para gerar PDF usando o servidor Node.js com Puppeteer
    document.getElementById('print-button').addEventListener('click', function () {
    // Primeiro atualizamos a visualização
    updatePreview();
    
    // Exibe um feedback visual para o usuário
    const originalButtonText = document.getElementById('print-button').innerHTML;
    document.getElementById('print-button').innerHTML = 'Gerando PDF...';
    document.getElementById('print-button').disabled = true;
    
    setTimeout(function() {
        try {
            // Obter o elemento da proposta
            const proposal = document.getElementById('proposal-preview');
            
            // Converter imagens para base64 para garantir que sejam incluídas no PDF
            const images = proposal.querySelectorAll('img');
            let imagePromises = [];

            images.forEach(img => {
                if (img.src) {
                    const imgPromise = fetch(img.src)
                        .then(response => response.blob())
                        .then(blob => {
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = function() {
                                    img.src = reader.result;
                                    resolve();
                                };
                                reader.readAsDataURL(blob);
                            });
                        })
                        .catch(error => {
                            console.error('Erro ao converter imagem:', error);
                        });
                    
                    imagePromises.push(imgPromise);
                }
            });            

            // Esperar todas as imagens serem convertidas
            Promise.all(imagePromises).then(() => {
                // Incluir estilos inline para garantir que sejam aplicados no PDF
                const styles = Array.from(document.styleSheets)
                    .filter(styleSheet => {
                        try {
                            return !styleSheet.href || styleSheet.href.startsWith(window.location.origin);
                        } catch (e) {
                            return false;
                        }
                    })
                    .map(styleSheet => {
                        try {
                            return Array.from(styleSheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('\n');
                        } catch (e) {
                            return '';
                        }
                    })
                    .join('\n');
            // Criar HTML completo com estilos inline
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Proposta FORFIRE</title>
                <style>
                    ${styles}
                    /* Estilos adicionais para garantir a aparência correta no PDF */
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                    
                    /* Ajustes para elementos específicos no PDF */
                    .proposal-body {
                        border: none;
                        padding: 20px;
                        background-color: white;
                    }
                    
                    /* Garantir que imagens sejam exibidas */
                    img {
                        max-width: 100%;
                        display: inline-block;
                    }
                    
                    /* Estilos para listas */
                    ul, ol {
                        padding-left: 20px;
                        margin-bottom: 10px;
                    }
                    
                    li {
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body>
                ${proposal.outerHTML}
            </body>
            </html>
            `;

            // Gerar nome do arquivo baseado no número da proposta
            const fileName = `${document.getElementById('proposal-number').value || 'proposta'}.pdf`;
            
            // URL do servidor Node.js - ajuste se necessário
            const serverUrl = `${window.location.origin}/generate-pdf`;
            
            // Enviar o HTML para o servidor
            fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: htmlContent,
                    filename: fileName
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Criar URL para o blob
                const url = window.URL.createObjectURL(blob);
                
                // Criar um elemento <a> para download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                
                // Adicionar à página e clicar para iniciar o download
                document.body.appendChild(a);
                a.click();
                
                // Limpar
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                const proposalField = document.getElementById('proposal-number');
                const manualValue = proposalField.value;
                let parts = manualValue.split('-');
                if (parts.length === 3) {
                    const manualNumber = parseInt(parts[1]);
                    if (!isNaN(manualNumber)) {
                        currentProposalNumber = manualNumber;
                    }
                }

                // Dentro do then() de sucesso na requisição para geração do PDF
                currentProposalNumber++;
                localStorage.setItem('ff_proposal_number', currentProposalNumber.toString());
                updateProposalNumber();
                
                // Restaurar o botão
                document.getElementById('print-button').innerHTML = originalButtonText;
                document.getElementById('print-button').disabled = false;
                
                console.log('PDF gerado com sucesso!');
            })
            .catch(error => {
                console.error('Erro ao gerar o PDF:', error);
                alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
                
                // Restaurar o botão
                document.getElementById('print-button').innerHTML = originalButtonText;
                document.getElementById('print-button').disabled = false;
            });
        });    
        } catch (error) {
            console.error('Erro ao preparar o HTML:', error);
            alert('Erro ao preparar o HTML. Verifique o console para mais detalhes.');
            
            // Restaurar o botão
            document.getElementById('print-button').innerHTML = originalButtonText;
            document.getElementById('print-button').disabled = false;
        }
    }, 500);
});
       
    // Inicializa a visualização da proposta
    updatePreview();
});
