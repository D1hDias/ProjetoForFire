// Variáveis globais
let mapaClientes = {};
let ignoreNextChange = false;

// ====== FUNÇÕES DO LOADER NO BOTÃO ======
function showButtonLoader() {
    const button = document.getElementById('print-button');
    if (button) {
        // Salva o texto original
        button.dataset.originalText = button.textContent;
        // Muda para loading
        button.textContent = 'Gerando PDF...';
        button.classList.add('loading');
        button.disabled = true;
        console.log('✅ Loader do botão ativado');
    }
}

function hideButtonLoader() {
    const button = document.getElementById('print-button');
    if (button) {
        // Restaura texto original
        button.textContent = button.dataset.originalText || 'Gerar PDF';
        button.classList.remove('loading');
        button.disabled = false;
        console.log('✅ Loader do botão desativado');
    }
}

let quillPreamble;
let quillProject;
let quillObservations;
let quillClarifications;
let quillObject;
let quillBudget;
let selectedServiceOrder = [];
let proposalReadyToSave = false;
let allowSave = false;

// --- SALVAR PROPOSTA (global) ---------------------------------
async function salvarPropostaLocalmente() {
    if (!allowSave) return;        // sai se não for chamado pelo botão
    if (!proposalReadyToSave) return;   // ainda não há nada no preview → não salva

    const todosCamposVazios =
        !document.getElementById('proposal-user').value.trim() &&
        !document.getElementById('proposal-reference').value.trim() &&
        !document.getElementById('client-select').value.trim() &&
        !document.getElementById('client-contact').value.trim();

    
    if (todosCamposVazios) {
        return; // não salva proposta vazia
    }

    const propostaId = document.getElementById('proposal-number').value;
    // Validação: só salva se o cliente selecionado existir no banco
    const clienteSelecionado = document.getElementById('client-select').value;
    const clienteValido = mapaClientes[clienteSelecionado];
    
    if (clienteSelecionado && !clienteValido) {
        alert('Erro: Cliente selecionado não existe no banco de dados. Por favor, selecione um cliente válido.');
        return;
    }

    const proposta   = {
        numero : propostaId,
        tipo   : document.getElementById('proposal-type').value,
        empresa: document.getElementById('company-selector').value,
        referencia: document.getElementById('proposal-reference').value,
        usuario    : document.getElementById('proposal-user').value,
        cliente    : clienteSelecionado,
        contato    : document.getElementById('client-contact').value,
        // Sempre usa dados do banco, nunca campos manuais
        clienteNome: clienteValido ? clienteValido.nome : '',
        localNome  : clienteValido ? clienteValido.nome : document.getElementById('location-name').value,
        localEndereco: clienteValido ? clienteValido.endereco : document.getElementById('location-address').value,
        preambulo  : document.getElementById('preambleDescription').value,
        objeto     : document.getElementById('objectDescription').value,
        observacoes: document.getElementById('observationsDescription').value,
        esclarecimentos: document.getElementById('clarificationsDescription').value,
        orcamento  : document.getElementById('budgetDescription').value,
        servicos : [...document.querySelectorAll('.project-option')].map(cb => ({
            id : cb.id,
            checked : cb.checked,
            descricao : cb.dataset.description || ''
        })),
        ordemServicos : typeof selectedServiceOrder !== "undefined" ? selectedServiceOrder : [],
        dataSalva  : new Date().toISOString()
    };

    await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: propostaId, data: proposta })
    });
    allowSave = false;
}

const textosPadraoPorServico = {
    "CERTIFICADO DE APROVAÇÃO CBMERJ": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Obtenção do certificado de aprovação (CA), em até D+30 dias úteis após a conclusão da obra (execução de todos os itens acima mencionados), junto ao CBMERJ;</li>
        <li>Emissão e Declaração de Responsável Técnico para procedimento assistido do Certificado de Aprovação (DCA) e ART (anotação de responsabilidade técnica), referente à instalação dos sistemas e dispositivos preventivos fixos, tais como: caixas de incêndio, canalização preventiva, rede de hidrantes, sprinklers, sistema de detecção e alarme de incêndio, válvulas, extintores e mangueiras de incêndio, em conformidade com COSCIP - Código de Segurança Contra Incêndio e Pânico. DCA é expedido somente por empresas instaladoras credenciadas junto ao CBMERJ;</li>
    </ul>
    <p>Considerações:</p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>A Contratada atestará e ficará como responsável técnico pela instalação dos sistemas e dispositivos preventivos fixos acima descritos perante o CBMERJ e CREA-RJ;</li>
        <li>A Contratada será responsável pelo requerimento padrão com tipo de solicitação "certificado de aprovação" do CBMERJ;</li>
        <li>A Contratada será responsável em protocolar à solicitação de vistoria do CBMERJ da edificação, bem como o acompanhamento técnico para obtenção do certificado de aprovação;</li>
        <li>A obtenção do CA (certificado de aprovação), somente será obtida após cumprida todas as exigências do LE (laudo de exigências).</li>
    </ul>
    <p>O Certificado de Aprovação é o documento expedido pelo CBMERJ que certifica o cumprimento de todas as exigências contidas no Laudo de Exigências da edificação. O Certificado de Aprovação não possui data de validade, no entanto este Certificado continua válido enquanto as características arquitetônicas da edificação (à época da emissão do Certificado) permanecer inalteradas.</p>
    <p>Para que uma edificação seja considerada regularizada junto ao Corpo de Bombeiros são necessários dois documentos: Laudo de Exigências e o Certificado de Aprovação.  A obtenção do Certificado de Aprovação junto ao CBMERJ (quartel) da área da edificação será de responsabilidade da Contratada.</p>
    <p><strong>Obrigações da Contratante no Processo de Certificação:</strong></p>
    <p>Para a execução de assessoria e obtenção da certificação aqui descrita, a Contratante deverá:</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer cópia do laudo de exigências do projeto de incêndio aprovado;</li>
        <li>Declaração do representante legal seja colocado em papel timbrando e colher assinatura do representante legal (incluir dados do representante legal);</li>
        <li>Cópia do contrato social ou estatuto;</li>
        <li>Cópia do RGI ou contrato de locação do imóvel em questão;</li>
        <li>Cópia do cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e se for o caso, procuração;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses da Central de Gás GLP e laudo de estanqueidade;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses do grupo moto gerador;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses do sistema de exaustão mecânica;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses do sistema da escada pressurizada;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses do sistema de ventilação mecânica e ar condicionado;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses do sistema de proteção contra descarga atmosférica SPDA;</li>
        <li>Cópia da ART referente à instalação ou manutenção válida por 12 meses da subestação;</li>
        <li>Cópia da OS ou declaração da concessionaria de água & esgoto da instalação ou operação do hidrante urbano tipo coluna conforme exigido na aprovação do projeto de incêndio (laudo de exigências);</li>
        <li>NFS aquisições da recarga dos extintores, mangueiras, detectores de fumaça, portas corta fogo, iluminação de emergência, espuma mecânica, sinalização de incêndio, etc;</li>
        <li>Cópia do contrato de prestação de serviços da brigada de incêndio + credenciamento CBMERJ + Carteiras dos Bombeiros Cadastrados + ART da prestação dos serviços;</li>
        <li>Cópia do relatório e ensaio dos materiais e produtos armazenados de líquidos inflamáveis e combustíveis;</li>
        <li>Cópia do plano de emergência e escape + ART – anotação de responsabilidade técnica conforme exigido na aprovação do projeto de incêndio (laudo de exigências);</li>
        <li>Cópia simples das pranchas do projeto de incêndio com a etiqueta de aprovação do CBMERJ (caso necessário);</li>
        <li>Pagamento da taxa DAEM CBMERJ para abertura do processo da obtenção do certificado de aprovação.</li>
      </ul>
    </div>
`,
    "CMI - CASA DE MÁQUINA DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação de 02 (duas) eletrobombas de xxCV para atender a rede preventiva fixa de incêndio;</li>
        <li>Fornecimento e instalação de 01 (uma) bomba jockey de xxCV para atender a rede de sprinklers;</li>
        <li>Fornecimento e instalação de 01 (um) quadro elétrico para automatizar o sistema de incêndio;</li>
        <li>Fornecimento e instalação de conexões e registros galvanizados padrão BSP;</li>
        <li>Montagem do sistema hidráulico compostos com pressostato, manômetro, tanque pneumático e válvula de retenção;</li>
        <li>Fornecimento da tubulação da saída da RTI (reserva técnica de incêndio) até cada CMI;</li>
        <li>Pintura na cor vermelha (segurança) das tubulações e conexões;</li>
        <li>Não faz parte do escopo a construção em alvenaria do abrigo da casa de máquina de incêndio;</li>
        <li>Testes finais e pressurização da rede preventiva fixa;</li>
        <li>Execução conforme informações do projeto de incêndio e informação disponibiliza;</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "EXTINTOR DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento de extintor tipo CO2 04 KGS (xx unidade);</li>
        <li>Fornecimento de extintores tipo AP 10 LTS (xx unidades);</li>
        <li>Fornecimento de extintores tipo CO2 06 KGS (xx unidades);</li>
        <li>Fornecimento de extintor tipo ABC 04 KGS (xx unidades);</li>
        <li>Fornecimento de extintor tipo PQS 04 KGS (xx unidades);</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "SERVIÇOS DE MANUTENÇÃO E RECARGA DE EXTINTORES DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p><strong>[INSERIR PLANILHLA AQUI]</strong></p><br><br>
    <p><strong>OBSERVAÇÕES:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>As recargas contemplam retestes e trocas de peças necessárias para a manutenção;</li>
        <li>Caso a necessidade de recarga seja superior à quantidade declarada, esta será cobrada à parte conforme valor unitário contratado.</li>
    </ul>
    </div>
`,
    "HIDRANTE DE COLUNA TIPO URBANO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
      <li>Somente fornecimento de 01 (hum) hidrante de coluna tipo urbano, conforme as informações descritas no projeto de incêndio aprovado;</li>
      <li>A Contratante deverá solicitar a aprovação e instalação da ligação do hidrante de coluna tipo urbano junto à concessionária de águas & esgotos do Estado do Rio de Janeiro;</li>
      <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    <p><strong>Nota: Caso seja isento pela Concessionária citada a instalação do hidrante de coluna tipo urbano devido à falta de viabilidade técnica, ficará a cargo da Contratada a solicitação ao CBMERJ da isenção desta exigência aprovada no projeto de incêndio. Fica a cargo da Contratante reunião de documentos e entrada no processo para análise de viabilidade da instalação de hidrante urbano junto a concessionária local. Apenas a concessionária de águas local poderá realizar a instalação do hidrante urbano tipo coluna.</strong></p>
    </div>
`,
    "ILUMINAÇÃO DE EMERGÊNCIA – (BLOCO AUTÔNOMO)": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e fixação no local indicado em projeto de XX (xxxxx) blocos autônomos de iluminação de emergência;</li>
        <li>Fornecimento e fixação de XX (xxxx) blocos autônomos conforme NBR 10898;</li>
        <li>Especificações: fluxo luminoso até 300 lumens, lâmpada fluorescente, potência 2 x 11W, tensão 110/220V;</li>
        <li>Ângulo de abertura da luz 63º, altura de instalação de 2,00m, autonomia de até 2 horas;</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    <p><strong>Nota: A alimentação das baterias das luminárias de emergência deverá ser suprida eletricamente através da interligação da edificação.</strong></p>
    </div>
`,
    "MANGUEIRA DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>SERVIÇOS DE MANUTENÇÃO E TESTE HIDROTASTICO DE MANGUEIRAS DE INCÊNDIO</p>
    <p>[INSERIR PLANILHA AQUI]</p>
    <p><strong>Observações:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Caso a necessidade de manutenção seja superior à quantidade declarada, esta será cobrada à parte conforme valor unitário contratado.</li>
    </ul>
    </div>
`,
    "MANUTENÇÃO PREVENTIVA DE PREVENÇÃO E COMBATE A INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>[INSERIR PLANILHA AQUI]</p>
    </div>
`,
    "MANUTENÇÃO CORRETIVA DE PREVENÇÃO E COMBATE A INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>[INSERIR PLANILHA AQUI]</p>
    </div>
`,
    "MANUTENÇÃO PREVENTIVA E CORRETIVA DE PREVENÇÃO E COMBATE A INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>[INSERIR PLANILHA AQUI]</p>
    </div>
`,
    "ELABORAÇÃO E APROVAÇÃO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
      <li>Analise das plantas de arquitetura recebidas em arquivo dwg (situação, fachada, cortes e layout) necessário como premissa para elaboração do projeto de incêndio;</li>
      <li>Elaboração e aprovação de projeto de segurança contra incêndio e pânico em conformidade com a COSCIP (Código de Segurança contra Incêndio e Pânico) e normas técnicas brasileiras e legislação vigente no Brasil;</li>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Dimensionar e detalhar canalização preventiva de hidrantes e sprinklers (quando necessários); Especificar e distribuir sistema móvel de extintores; Dimensionar o sistema de sinalização de segurança contra incêndio e pânico; Dimensionar e detalhar sistema de detecção de alarme de incêndio, SPDA e outros (quando necessário); Fornecer cópia do projeto em DWG para contratante; Elaborar Memorial Descritivo e Memorial de Cálculo contemplando todos os sistemas.</li> 
        </ul>  
      <li>Aprovação junto a Diretoria Geral de Serviços Técnicos do CBMERJ com emissão de novo Laudo de Exigências;</li>
      <li>ART - Anotações de responsabilidade técnica do projeto;</li>
      <li>Consideramos para execução do projeto de segurança aqui descrito, um prazo de até 30 (trinta) dias após a data da confirmação do pedido e com todas as pendências técnicas solucionadas. Durante o prazo de elaboração do projeto, a FORFIRE não se responsabiliza por notificações ou autuações emitidas pelo CBMERJ, e não será responsável por pagamentos de multas destinadas a edificação;</li>
      <li>O Prazo da aprovação do projeto de segurança junto à DGST/CBMERJ é de aproximadamente 90 (noventa) dias a contar da data da entrega do respectivo projeto para análise. Ressaltamos, porém, que este prazo é REGULAMENTAR e depende EXCLUSIVAMENTE do Corpo de Bombeiros, ou seja, não sendo este de responsabilidade da Contratada. Dessa forma o prazo aproximado desde a elaboração do projeto até a entrega do Laudo de Exigências poderá ser até 80 (oitenta) dias úteis.</li>
    </ul>

    <p><strong>Obrigações da Contratante para o Projeto:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Para a execução e aprovação do projeto de segurança aqui descrito, a Contratante deverá:</li>
        <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer plantas ARQ em formato dwg (plantas situação, fachada, cortes e layout) necessário como premissa para elaboração do projeto de incêndio;</li>
        <li>Fornecer cópia do contrato de locação ou RGI do imóvel;</li>
        <li>Fornecer cópia do Contrato Social ou Estatuto;</li>
        <li>Fornecer cópia do cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e se for o caso, procuração;</li>
        <li>Cópia do LE e CA da aprovação do todo (caso o imóvel em questão esteja localizado dentro de agrupamento comercial;</li>
        <li>Efetuar o pagamento dos emolumentos necessários, através do recolhimento ao Banco Bradesco, em guia própria, da taxa de prevenção contra incêndio (DAEM), na quantidade de 0,088531 UFIR RJ x R$ 4,7508 (Valor UFIR RJ) x m² da área construída (ATC) referente à análise e aprovação do projeto de combate a incêndio;</li>
        <li><u><strong>Confirmar a existência de ambientes com estocagem de inflamáveis, </u></strong>e em caso positivo nos informar qual tipo de inflamável é estocado e qual o volume destes.</li>
        <li><u><strong>* No caso de uso de gás </u></strong>(Gás Liquefeito de Petróleo ou GN), e em caso positivo, nos fornecer cópia do projeto executivo com as informações de especificação e dimensionamento o volume dos tipos de equipamentos ocupa o referido espaço;</li>
        <li><u><strong>* No caso de uso de ambientes com exaustão mecânica, </u></strong>e em caso positivo, nos fornecer cópia do projeto executivo com as informações de especificação e dimensionamento o volume dos tipos de equipamentos ocupa o referido espaço;</li>
        <li>Caso a edificação (s) ou pavimento (s) esteja localizado em shopping center, centro comercial, ou qualquer agrupamento comercial, deverá nos fornecer cópia em DWG do projeto de incêndio aprovado, do LE (laudo de exigências) e CA (certificado de aprovação) da edificação principal. Ressaltamos que a falta destes documentos pode causar indeferimento por parte do CBMERJ em relação à aprovação do projeto de segurança contra incêndio e pânico da edificação e/ou imóvel em questão. Se a edificação e/ou imóvel tenha sido construído (habite-se) anterior a vigência do Decreto No. 897 de 21 de setembro de 1976 (COSCIP), nos fornecer cópia autenticada do RGI da edificação e/ou imóvel em questão.</li>
        </ul>
    </ul>

    <p><strong><u>Nota (*): A não apresentação dos projetos complementares para compor o processo de aprovação do projeto de incêndio, acarretará em indeferimento do processo por parte do CBMERJ.</u></strong></p>
    </div>
`,
    "ELABORAÇÃO, APROVAÇÃO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO COM LEVANTAMENTO ARQUITETÔNICO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
      <li>Levantamento arquitetônico (plantas situação, fachada e cortes) necessário como premissa para elaboração do projeto de incêndio; </li>
      <li>Elaboração e aprovação de projeto de segurança contra incêndio e pânico em conformidade com a COSCIP (Código de Segurança contra Incêndio e Pânico) e normas técnicas brasileiras e legislação vigente no Brasil;</li>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Dimensionar e detalhar canalização preventiva de hidrantes e sprinklers (quando necessários); Especificar e distribuir sistema móvel de extintores; Dimensionar o sistema de sinalização de segurança contra incêndio e pânico; Dimensionar e detalhar sistema de detecção de alarme de incêndio, SPDA e outros (quando necessário); Fornecer cópia do projeto em DWG para contratante; Elaborar Memorial Descritivo e Memorial de Cálculo contemplando todos os sistemas.</li>
        </ul>
      <li>Aprovação junto a Diretoria Geral de Serviços Técnicos do CBMERJ com emissão de novo Laudo de Exigências;</li>
      <li>ART - Anotações de responsabilidade técnica do projeto;</li>
      <li>Consideramos para execução do projeto de segurança aqui descrito, um prazo de até 30 (trinta) dias após a data da confirmação do pedido e com todas as pendências técnicas solucionadas. Durante o prazo de elaboração do projeto, a FORFIRE não se responsabiliza por notificações ou autuações emitidas pelo CBMERJ, e não será responsável por pagamentos de multas destinadas a edificação;</li>
      <li>O Prazo da aprovação do projeto de segurança junto à DGST/CBMERJ é de aproximadamente 90 (noventa) dias a contar da data da entrega do respectivo projeto para análise. Ressaltamos, porém, que este prazo é REGULAMENTAR e depende EXCLUSIVAMENTE do Corpo de Bombeiros, ou seja, não sendo este de responsabilidade da Contratada. Dessa forma o prazo aproximado desde a elaboração do projeto até a entrega do Laudo de Exigências poderá ser até 80 (oitenta) dias úteis.</li>
    </ul>
    <p><strong><u>Obrigações da Contratante para o Projeto:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Para a execução e aprovação do projeto de segurança aqui descrito, a Contratante deverá:</li>
        <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer cópia do contrato de locação ou RGI do imóvel; </li>
        <li>Fornecer cópia do Contrato Social ou Estatuto;</li>
        <li>Fornecer cópia do cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e se for o caso, procuração;</li>
        <li>Fornecer cópia do LE e CA da aprovação do todo (caso o imóvel em questão esteja localizado dentro de agrupamento comercial;</li>
        <li>Efetuar o pagamento dos emolumentos necessários, através do recolhimento ao Banco Bradesco, em guia própria, da taxa de prevenção contra incêndio (DAEM), na quantidade de 0,088531 UFIR RJ x R$ 4,7508 (Valor UFIR RJ) x m² da área construída (ATC) referente à análise e aprovação do projeto de combate a incêndio;</li>
        <li><u>Confirmar a existência de ambientes com estocagem de inflamáveis,</u> e em caso positivo nos informar qual tipo de inflamável é estocado e qual o volume destes.</li>
        <li><u>* No caso de uso de gás</u> (Gás Liquefeito de Petróleo ou GN), e em caso positivo, nos fornecer cópia do projeto executivo com as informações de especificação e dimensionamento o volume dos tipos de equipamentos ocupa o referido espaço;</li>
        <li><u>* No caso de uso de ambientes com exaustão mecânica,</u> e em caso positivo, nos fornecer cópia do projeto executivo com as informações de especificação e dimensionamento o volume dos tipos de equipamentos ocupa o referido espaço;</li>
        <li>Caso a edificação (s) ou pavimento (s) esteja localizado em shopping center, centro comercial, ou qualquer agrupamento comercial, deverá nos fornecer cópia em DWG do projeto de incêndio aprovado, do LE (laudo de exigências) e CA (certificado de aprovação) da edificação principal. Ressaltamos que a falta destes documentos pode causar indeferimento por parte do CBMERJ em relação à aprovação do projeto de segurança contra incêndio e pânico da edificação e/ou imóvel em questão. Se a edificação e/ou imóvel tenha sido construído (habite-se) anterior a vigência do Decreto No. 897 de 21 de setembro de 1976 (COSCIP), nos fornecer cópia autenticada do RGI da edificação e/ou imóvel em questão.</li>
        </ul>
    </ul>
    <strong>Nota:</strong> A ausência dos projetos complementares poderá causar o indeferimento do processo pelo CBMERJ.</p>
    </div>
`,
    "ATUALIZAÇÃO, ELABORAÇÃO E NOVA APROVAÇÃO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
      <li>Análise dos projetos de incêndio atual aprovado (Laudo de Exigências) e plantas arquitetônicas atualizadas recebidas (plantas situação, fachada, cortes e layout) necessárias como premissa para elaboração do projeto de incêndio;</li>
      <li>Elaboração, atualização e aprovação de projeto de segurança contra incêndio e pânico em conformidade com a COSCIP (Código de Segurança contra Incêndio e Pânico) e normas técnicas brasileiras e legislação vigente no Brasil;</li>
        <ul style="margin: 0; padding-left: 20px;">
          <li>	Dimensionar e detalhar canalização preventiva de hidrantes e sprinklers (quando necessários); Especificar e distribuir sistema móvel de extintores; Dimensionar o sistema de sinalização de segurança contra incêndio e pânico; Dimensionar e detalhar sistema de detecção de alarme de incêndio, SPDA e outros (quando necessário); Fornecer cópia do projeto em DWG para contratante; Elaborar Memorial Descritivo e Memorial de Cálculo contemplando todos os sistemas.</li>
        </ul>
      <li>Aprovação junto a Diretoria Geral de Serviços Técnicos do CBMERJ com emissão de novo Laudo de Exigências;</li>
      <li>ART - Anotações de responsabilidade técnica do projeto;</li>
      <li>Consideramos para execução do projeto de segurança aqui descrito, um prazo de até 30 (trinta) dias após a data da confirmação do pedido e com todas as pendências técnicas solucionadas. Durante o prazo de elaboração do projeto, a FORFIRE não se responsabiliza por notificações ou autuações emitidas pelo CBMERJ, e não será responsável por pagamentos de multas destinadas a edificação;</li>
      <li>O Prazo da aprovação do projeto de segurança junto à DGST/CBMERJ é de aproximadamente 90 (noventa) dias a contar da data da entrega do respectivo projeto para análise. Ressaltamos, porém, que este prazo é REGULAMENTAR e depende EXCLUSIVAMENTE do Corpo de Bombeiros, ou seja, não sendo este de responsabilidade da Contratada. Dessa forma o prazo aproximado desde a elaboração do projeto até a entrega do Laudo de Exigências poderá ser até 80 (oitenta) dias úteis.</li>
    </ul>

    <p><strong><u>Obrigações da Contratante para o Projeto:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Para a execução e aprovação do projeto de segurança aqui descrito, a Contratante deverá:  </li>
    </ul>
        <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer arquivo eletrônico e cópia simples do projeto de incêndio aprovado (chancelado);</li>
        <li>Fornecer plantas arquitetônicas atualizadas, com as plantas de situação, fachada, cortes e layout, necessárias como premissa para elaboração do projeto de incêndio;</li>
        <li>Fornecer cópia do contrato de locação ou RGI do imóvel; </li>
        <li>Fornecer cópia do Contrato Social ou Estatuto;</li>
        <li>Fornecer cópia do cartão CNPJ;</li>
        <li>Cópia do RG do representante legal e se for o caso, procuração;</li>
        <li>Fornecer cópia do LE e CA da aprovação do todo em nome do condominio (caso o imóvel em questão esteja localizado dentro de agrupamento comercial;</li>
        <li>Efetuar o pagamento dos emolumentos necessários, através do recolhimento ao Banco Bradesco, em guia própria, da taxa de prevenção contra incêndio (DAEM), na quantidade de 0,088531 UFIR RJ x R$ 4,7508 (Valor UFIR RJ) x m² da área construída (ATC) referente à análise e aprovação do projeto de combate a incêndio;</li>
        <li><u>Confirmar a existência de ambientes com estocagem de inflamáveis, </u>e em caso positivo nos informar qual tipo de inflamável é estocado e qual o volume destes.</li>
        <li><u>* No caso de uso de gás </u>(Gás Liquefeito de Petróleo ou GN), e em caso positivo, nos fornecer cópia do projeto executivo com as informações de especificação e dimensionamento o volume dos tipos de equipamentos ocupa o referido espaço;</li>
        <li><u>* No caso de uso de ambientes com exaustão mecânica, </u>e em caso positivo, nos fornecer cópia do projeto executivo com as informações de especificação e dimensionamento o volume dos tipos de equipamentos ocupa o referido espaço;</li>
        <li>Caso a edificação (s) ou pavimento (s) esteja localizado em shopping center, centro comercial, ou qualquer agrupamento comercial, deverá nos fornecer cópia em DWG do projeto de incêndio aprovado, do LE (laudo de exigências) e CA (certificado de aprovação) da edificação principal. Ressaltamos que a falta destes documentos pode causar indeferimento por parte do CBMERJ em relação à aprovação do projeto de segurança contra incêndio e pânico da edificação e/ou imóvel em questão. Se a edificação e/ou imóvel tenha sido construído (habite-se) anterior a vigência do Decreto No. 897 de 21 de setembro de 1976 (COSCIP), nos fornecer cópia autenticada do RGI da edificação e/ou imóvel em questão.</li>
    </ul>
    <p><strong>Nota (*): A não apresentação dos projetos complementares para compor o processo de aprovação do projeto de incêndio, acarretará em indeferimento do processo por parte do CBMERJ.</strong></p>
    </div>
`,
    "ELABORAÇÃO DE PROJETO EXECUTIVO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO – AS BUILT": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
      <li>A elaboração de projeto de incêndio executivo consiste no levantamento in loco de toda a instalação da rede preventiva fixa de incêndio e de mais informações pertinentes ao projeto de incêndio aprovado.</li>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Digitalização das plantas físicas existentes; Levantamento em Campo; Verificação de documentação recebida (layout ARQ atualizado); Elaboração de desenho do sistema de incêndio instalado;</li>
        </ul>     
      <li>Projeto de segurança contra incêndio e pânico com as instalações existentes nos seguintes pavimentos: Térreo e Mezanino, em conformidade com a COSCIP (Código de Segurança contra Incêndio e Pânico) e normas técnicas brasileiras e legislação vigente no Brasil;</li>
      <li>Fornecimento de plantas em formato DWG e PDF;</li>
      <li>Consideramos para execução do projeto de segurança aqui descrito, um prazo de até 30 (trinta) dias após a data da confirmação do pedido e com todas as pendências técnicas solucionadas. Durante o prazo de elaboração do projeto, a FORFIRE não se responsabiliza por notificações ou autuações emitidas pelo CBMERJ, e não será responsável por pagamentos de multas destinadas a edificação.</li>
    </ul>

    <p><strong><u>Obrigações da Contratante para o Projeto:</u></strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Para a execução do projeto executivo aqui descrito, a Contratante deverá:</li>
        <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecer projeto de incêndio atual e de arquitetura futura em DWG, contendo planta baixa e cortes para elaboração do projeto executivo de incêndio.</li>
        </ul>
    </ul>

    <p><strong>Nota:</strong> Durante o período de elaboração, a FORFIRE não se responsabiliza por notificações ou autuações emitidas pelo CBMERJ, nem por multas relacionadas à edificação.</p>
    </div>
`,
    "PROPOSTA TÉCNICA DE CONTRATO DE MANUTENÇÃO PREVENTIVA DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>Prezados,</p>
    <br>
    <p>Conforme solicitado, apresentamos nossa proposta técnica para Contrato de Manutenção Preventiva e Corretiva do Sistema de Prevenção e Combate a Incêndio, a serem executadas no XXXXXX do XXXXX, situado na XXXXXXXX, XXX – XXXX – Rio de Janeiro/RJ, conforme a especificação técnica abaixo, e escopo e condições disponibilizados no processo.</p>
    <br>
    <p>Com operações similares ao escopo proposto a FORFIRE atende a demandas de clientes como TCM-RJ (Tribunal de Contas do Município do Rio de Janeiro), TJERJ (Tribunal de Justiça do Estado do Rio de Janeiro), AGM (Logística), VTAL-Oi (Telecomunicações), Escola Americana EARJ (Escolar), BRPRA (Ativos Imobiliários), L’ORÉAL (Cosmético), IRON MOUNTAIN (Gestão Docs), IBR RE BRASIL (Seguros), entre outros. A FORFIRE possui uma equipe multidisciplinar experiente, composta de engenheiros, técnicos e administradores, especialistas na disciplina de Prevenção de Combate a Incêndio.</p>
    <br>
    <p>Declaramos que a FORFIRE tem capacidade produtiva e expertise técnica para o atendimento pleno das premissas passadas para esta concorrência. Na proposta que segue em anexo, procuramos reunir nossas melhores competências para elaborarmos uma proposta que seja eficaz no aspecto técnico e competitiva no aspecto comercial, sempre mantendo o padrão de qualidade proposto pela FORFIRE no atendimento dos seus clientes. </p>
    <br>
    <p>A FORFIRE agradece a oportunidade e se coloca à disposição para quaisquer esclarecimentos que sejam necessários.</p>
    <br>
    <p>Cordialmente,</p><br>
       <div class="signature">
        <img src="sign.jpg" alt="Assinatura" style="display: block;">
       </div>
    <br>
    <br>   
    <b>1. INTRODUÇÃO</b>
    <p>A FORFIRE vem apresentar sua <b>proposta de contrato de prestação de serviços de manutenção preventiva e corretiva do sistema de prevenção e combate a incêndio (CMI, Hidrantes, Sprinklers, Extintores, SDAI, SPAE e SPDA) e manutenção corretiva dos extintores portátil de incêndio (serviços de recarga), no xxxxxxxxxxxxxxxxx, descritos no corpo desta,</b> em conformidade com COSCIP (Código de Segurança contra Incêndio e Pânico - CBMERJ), normas técnicas e legislação brasileira.</p>
    <br><br>

    <b>2. COMPOSIÇÕES DO SISTEMA DE PREVENÇÃO E COMBATE A INCÊNDIO</b>
    <ul>
    <li>Casa de máquinas de incêndio (CMI)</li>
    <li>Sistema de hidrantes (HID)</li>
    <li>Sistema de sprinklers (SPK)</li>
    <li>Recarga de Extintores de Incêndio (EXT)</li>
    <li>Sistema de Detecção e Alarme de Incêndio (SDAI)</li>
    <li>Sistema Pressurização de Ar Escada de Incêndio (SPAE)</li>
    <li>Sistema de proteção contra descargas atmosféricas (SPDA)</li>
    </ul>
    <br><br>

    <b>3. DEFINIÇÕES</b>
    <p>Entende se por Execução dos Serviços de Manutenção as seguintes descrições:</p>
    <p>MANUTENÇÃO PREVENTIVA – A manutenção preventiva destina-se a manter o sistema dentro das condições normais de funcionamento, evitando a ocorrência de quaisquer problemas, de acordo com o estipulado no contrato de manutenção.</p>
    <p>Deverão ser efetuadas vistorias com emissão de relatório efetuando as limpezas e aferições recomendadas pelas Normas vigentes.</p>
    <p>A Manutenção Preventiva será realizada mediante a programação antecipada e agendada entre segunda-feira a sexta-feira, no horário de 8:00 as 18:00 horas.</p>
    <p>MANUTENÇÃO CORRETIVA – A manutenção corretiva compreende as alterações, consertos, trocas de circuitos, dispositivos, materiais e equipamentos que se façam necessários a fim de proporcionar o funcionamento perfeito de todo o sistema, conforme abaixo discriminado:</p>
    <p>Não faz parte do escopo desta proposta a Manutenção Corretiva, para os casos em que haja a necessidade de intervenção corretiva no sistema com a reposição de peças, a FORFIRE deverá apresentar relatório de manutenção com a discriminação do problema e ação corretiva necessária, bem como especificação das peças a serem substituídas. A aquisição dessas peças será de responsabilidade da Contratante, enquanto que o serviço para reposição das mesmas é parte integrante do contrato de manutenção. Na situação <b>EMERGENCIAL</b> de manutenção corretiva a <b>CONTRATADA</b> atenderá a <b>CONTRATANTE</b> no prazo de até 72 horas.</p>
    <br><br>

    <b>4. ESCOPO DESTA PROPOSTA - SOLUÇÕES TÉCNICAS GLOBAIS</b>
    <p>Manutenções Preventivas de 01 (uma) CMI (casa de máquina de incêndio)<br>[INSERIR PLANILHA AQUI]</p><br><br>

    <p>Manutenções Preventivas da Rede de Hidrantes Simples<br>[INSERIR PLANILHA AQUI]</p><br><br>

    <p>Manutenções Preventivas da Rede de Sprinklers<br>[INSERIR PLANILHA AQUI]</p><br><br>

    <p>Manutenções Preventivas dos Extintores de Incêndio<br>[INSERIR PLANILHA AQUI]</p><br><br>

    <p>Manutenções Preventivas do Sistema de Detecção e Alarme de Incêndio (SDAI) e Sistema Pressurização da Escada (SPAE)<br>[INSERIR PLANILHA AQUI]</p><br><br>

    <p>Manutenções Preventivas do Sistema de Proteção contra Descargas Atmosféricas (SPDA)<br>[INSERIR PLANILHA AQUI]</p><br><br>

    <p>SPDA - CAPTAÇÃO: 01 (um) mastro captores com estaiamento rígido h = 4 m acoplado com captor Franklin e Anel captor - Gaiola de Faraday constituído por cabo de cobre nu de bitola 35 mm² em todo o beiral - DESCIDAS, sendo: 01 (um) Condutor(es) de descida(s) aparente(s) com cabo de cobre de bitola 35 mm² e 03 (três) Condutor(es) de descida(s) estrutural “RE-BAR - ATERRAMENTO:  caixa de inspeção suspensa com 01 (um) ponto de inspeção</p>
    <br><br>
    

    <b>5. DOS EQUIPAMENTOS INSTALADOS – CONFORME LAUDO DE EXIGÊNCIAS – CBMERJ</b>
    <p>[INSERIR PLANILHAS AQUI]</p>
    <br><br>
    <p><b>NOTA: Os equipamentos e materiais listados pela CONTRATADA neste quadro são itens a serem cumpridas pela CONTRATANTE, pois foram/serão exigidos através do projeto de incêndio aprovado (Laudo de Exigências LE-02785/24 CBMERJ). Será de responsabilidade da CONTRATADA na manutenção preventiva sinalizar através de relatório a falta e/ou a necessidade de cumprimento de quaisquer exigências para a CONTRATANTE.</b></p>
    <br><br>

    <b>6. DAS VISTORIAS</b>
    <p>A <b>CONTRATADA</b>, em horário a ser fixado pelo <b>CONTRATANTE</b>, disponibilizará técnicos especializados que efetuarão vistorias nos equipamentos e materiais, objeto deste contrato, percorrendo todas as áreas do local da <b>CONTRATANTE</b> protegidas por estes, objetivando uma avaliação visual de toda a instalação. Por ocasião destas vistorias a <b>CONTRATADA</b> poderá efetuar serviços de testes nos equipamentos e materiais para avaliação do desempenho.</p>
    <br><br>
    <p>Ao final de cada vistoria mensal a <b>CONTRATADA</b> elaborará um Relatório de Inspeção, informando o <b>CONTRATANTE</b> sobre as atividades desenvolvidas, os serviços executados, e apontando todas as irregularidades encontradas, bem como os procedimentos adotados para corrigi-las. O Relatório de Inspeção deverá ser assinado pelo <b>CONTRATANTE</b>, na pessoa de seu representante a ser oportunamente indicada, e por um responsável técnico da <b>CONTRATADA</b>. A <b>CONTRATADA</b> apresentará anualmente relatório com respectivo laudo técnico e ART das atividades referentes a esta periodicidade.</p>
    <br><br>

    <b>7. DOS PROCEDIMENTOS NA EXECUÇÃO DOS SERVIÇOS</b>
    <p><b>A CONTRATADA</b> durante a execução dos serviços ora avençados obriga-se a obter e a seguir as recomendações e/ou instruções de manutenção dos fabricantes dos sistemas, equipamentos e materiais relacionados ao objeto da presente contratação.<br><br>
    Na ausência de recomendações e/ou instruções de manutenção dos fabricantes dos referidos sistemas, equipamentos e materiais, utilizar-se-á o próprio plano de manutenção, cujos procedimentos serão submetidos previamente e por escrito, para a aprovação do <b>CONTRATANTE</b>.<br><br>
    O <b>CONTRATANTE</b> poderá fiscalizar os serviços ora contratados, diretamente ou por intermédio de prepostos devidamente credenciados, obrigando-se a <b>CONTRATADA</b> a facilitar a execução dessa fiscalização.<br><br>
    O <b>CONTRATANTE</b> envidará todos os seus esforços para que a <b>CONTRATADA</b> obtenha todas as facilidades e livre acesso aos sistemas, equipamentos e materiais, isto para que a execução dos serviços ora contratados seja perfeita tecnicamente.<br><br>
    <b>Dos Critérios Gerais da Execução:</b> Será designado, como Gestor do Contrato, um representante da <b>CONTRATADA</b> para executar operacionalmente as ações de acompanhamento físico, controle, gestão administrativa e financeira do contrato. Os serviços serão executados através de equipe especializada, cuidando para que estes se desenvolvam sob o gerenciamento de seu preposto.<br><br>
    Planejamento da rotina diária de trabalho com base nas informações e solicitações encaminhadas pelo Gestor do Contrato, cuidando para que os serviços sejam prestados dentro de padrões de excelência sob os aspectos da organização, eficiência, qualidade e economicidade, submetendo-se estes ao crivo e avaliação permanentes do Gestor do Contrato.</p>
    <br><br>

    <b>8. PRÉDIOS QUE SERÃO VISTORIADAS NA MANUTENÇÃO PREVENTIVA</b>
    <p><strong>O local para prestação de serviço dentro do Estado do Rio de Janeiro:</strong></p>
    <ul>
    <li>PRÉDIO xxxxxxxxxx, situado na xxxxxxxxxxxx, xxxxx – Centro/RJ</li>
    </ul>
    <br><br>

    <b>9. DOS CRITÉRIOS DE SUSTENTABILIDADE</b>
    <p>Os serviços obedecerão aos critérios de gestão ambiental estabelecido nas legislações, normas e regulamentos específicos ao serviço, visando à melhoria e o desempenho dos processos de trabalho quanto aos aspectos ambientais, sociais e econômicos.<br><br>
    As atividades atendem à legislação federal, estadual, municipal, normas e regulamentos em vigor. Execução das atividades promovendo a conservação dos recursos naturais sejam eles hídricos edáficos e atmosféricos, no que couber.<br><br>
    As atividades desempenhadas serão conduzidas considerando a preservação, conservação e a recuperação do ecossistema, desenvolvendo suas ações de forma a valorizar o bem-estar dos trabalhadores, promovendo a qualidade de vida.<br><br>
    Adequamos permanentemente o PCMSO (Programa de Controle Médico de Saúde Ocupacional – NR 07), PPRA (Programa de Prevenção dos Riscos Ambientais – NR 09) e o ASO (Atestado de Saúde Ocupacional) aos novos riscos que forem identificados durante a execução do contrato, garantindo a segurança de todos os profissionais alocados na contração.<br><br>
    Realizamos a coleta de resíduos com empresas especializadas e habilitadas pelo IBAMA e legislação ambiental vigente.
    </p>
    <br><br>

    <b>10. DA REMUNERAÇÃO</b>
    <p>Em remuneração pelos serviços prestados, a <b>CONTRATADA</b> fará jus aos valores informados na proposta comercial.<br><br>
    No valor mencionado acima já estão inclusas as impostos e despesas com equipamentos e mão de obra para garantir o objeto do presente contrato.<br><br>
    Todos os serviços, equipamentos, peças e materiais de prevenção de combate a incêndio que precisarem ser substituídas identificadas na <b>Manutenção Preventiva</b>, serão faturados à parte, mediante prévia aprovação de orçamento pela <b>CONTRATANTE</b>, por escrito.
    </p>
    <br><br>

    <b>11. PRAZOS E FORMA DE PAGAMENTO</b>
    <p>Os pagamentos serão realizados em 28 dias após entrega da respectiva Nota Fiscal dos serviços prestados através de depósito na conta corrente da <b>CONTRATADA</b> mediante a apresentação da respectiva Nota Fiscal até o dia 5 do mês subsequente ao mês da prestação.<br><br>
    O pagamento deverá ser executado através de depósito bancário na conta da FORFIRE – Banco XX – Agência: XXXX – Conta Corrente: XXXXX-X. O prazo da prestação dos serviços será de 24 meses a partir da assinatura do contrato entre as partes.<br><br>
    </p>
    <br><br>

    <b>12. PREMISAS TÉCNICAS</b>
    <p>Admitimos ao longo dos trabalhos que a <b>FORFIRE</b> tem a orientação direta de um representante da <b>XXXXX</b>, e deverá manter a equipe técnica informada sobre a evolução deste trabalho, inclusive sobre eventuais alterações de requisitos no decorrer dos serviços. <br><br>
    Caso a <b>XXXXXX</b> requisite alterações às condições aqui apresentadas e estas resultam em alteração dos prazos ou escopo dos trabalhos da <b>FORFIRE</b>, desde já, se estabelece que as partes revisem as condições técnicas apresentadas, não permitindo em momento algum o desequilíbrio dos serviços ora propostos.<br><br>
    A presente proposta foi elaborada com base nas informações disponibilizadas pela <b>XXXXXX</b> a visita e vistoria in loco. Caso haja alteração nos projetos executivos da edificação, a presente proposta deverá ser revista. 
    </p>
    <br><br>

    <b>13. DECLARAÇÕES DE COMPROMETIMENTO</b>
    <p>SIGILOS DE INFORMAÇÕES<br>
    A <b>FORFIRE</b> informa que preservará o sigilo de toda a documentação que lhe for confiada e que os documentos disponibilizados pela <b>XXXXXX</b> para esta licitação serão devidamente empregados no desenvolvimento dos serviços contratados.<br><br>
    CONCORDÂNCIA<br>
    A <b>FORFIRE</b> declara estar de acordo com todas as informações descritas no documento fornecido pela <b>CONTRATANTE</b> denominado especificação técnica de obras civis datado de 19/09/2017 versão 01. Qualquer divergência entre a proposta apresentada pela <b>CONTRATANTE</b> e o documento da <b>CONTRATADA</b> prevalecerão às informações descritas no documento da <b>CONTRATANTE</b>.<br><br>
    TRABALHOS INFANTIS E ESCRAVO<br>
    A <b>FORFIRE</b> declara para fins do disposto no inciso V do art. 27 da Lei no 8.666, de 21 de junho de 1993, acrescido pela Lei no 9.854, de 27 de outubro de 1999, que não emprega menor de dezoito anos em trabalho noturno, perigoso ou insalubre e não emprega menor de dezesseis anos.<br><br>
    USO DE EPI (EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL)<br>
    A <b>FORFIRE</b> declara para fins de responsabilidade, que disponibiliza mão de obra especializada e EPIs relativa à execução de todos os serviços relacionados na presente proposta.
    </p>
    <br><br>

    <b>14. ESCLARECIMENTOS: </b>
    <p>Os valores e condições apresentados terão validade de 30 dias e estarão vigentes a partir da data de assinatura do contrato.<br><br>
    Na expectativa de um pronunciamento favorável, subscrevemo-nos com elevada e distinta consideração.<br><br>
    Qualquer dúvida ou esclarecimentos adicionais, por favor, nos avise.</p>

    </div>
`,
    "REDE DE HIDRANTES": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação da rede de canalização preventiva fixa de hidrantes com mão de obra especializada para instalação de XX (xxxxx) hidrantes simples com tubulação de aço carbono DIN 2440 CL10 de 2.1/2";</li>
        <li>Fornecimento e instalação de xx (xxxxxx) caixas de incêndio 0,70 x 0,50 x 0,25;</li>
        <li>Fornecimento e instalação de xx (xxxxxx) mangueiras tipo 2 de 1 ½” de 15 mts;</li>
        <li>Fornecimento e instalação de xx (xxxxxx) esguichos diâmetro 65mm (2 ½”);</li>
        <li>Fornecimento e instalação de xx (xxxx) chaves storz diâmetro 65mm (2½”);</li>
        <li>Fornecimento e instalação de xx (xxxxxxx) registros globo diâmetro 65mm (2 ½”);</li>
        <li>Fornecimento e instalação de xx (xxxxxx) adaptador de 65mm (2 ½”);</li>
        <li>Fornecimento e instalação de base de sustentação da tubulação;</li>
        <li>Fornecimento e instalação de conexões diversas de ferro galvanizado, equipamentos, materiais de fixação da tubulação e demais materiais normatizados de acordo com a ABNT - Associação Brasileira de Normas Técnicas, NBRs – Normas Brasileiras Regulamentadoras, demais normas ou certificações aplicáveis;</li>
        <li>Envelopamento e pintura da tubulação nos trechos onde necessitar abertura de piso;</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "SAI – SISTEMA DE ALARME DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
      <li>Fornecimento e instalação de XX (xxxxx) dispositivos do sistema de alarme de incêndio, distribuídos conforme abaixo:s</li>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Fornecimento e instalação de XX (xxxx) central de alarme;</li>
          <li>Fornecimento e instalação de XX (xxxx) acionador manual com carcaça plástica vermelha, 24VCC;</li>
          <li>Fornecimento e instalação de XX (xxxx) alertador sonoro e visual, sirene eletrônica + estrobo;</li>
          <li>Fornecimento de materiais de infraestrutura seca: Condulete de alumínio 4"x4; Resistência de final de linha (47OHMS); Eletroduto de aço galvanizado; Fiação AF control 2x1,5mm² blindado com malha e dreno e indicação de laço; Fiação dos alertadores sonoro/visual 2x2,5mm²;	Fornecimento de materiais de infraestrutura seca: Condulete de alumínio 4"x4; Resistência de final de linha (47OHMS); Eletroduto de aço galvanizado; Fiação AF control 2x1,5mm² blindado com malha e dreno e indicação de laço; Fiação dos alertadores sonoro/visual 2x2,5mm²;</li>
          <li>Teste operacional de central de alarme.</li>
        </ul>
      <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "SDAI – SISTEMA DE DETECÇÃO E ALARME DE INCÊNDIO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação de XX (xxxxxx) dispositivos do sistema de detecção e alarme, distribuídos conforme abaixo:</li>
          <ul style="margin: 0; padding-left: 20px;">
          <li>Fornecimento e instalação de XX (xxxxx) central de alarme;</li>
          <li>Fornecimento e instalação de XX (xxxxxxxx) detectores ópticos de fumaça;</li>
          <li>Fornecimento e instalação de XX (xxxxxxxx) detectores de temperatura termovelocimétrico;</li>
          <li>Fornecimento e instalação de XX (xxxxxx) detectores térmicos;</li>
          <li>Fornecimento e instalação de XX (xxxxx) acionadores manuais com carcaça plástica vermelha, 24VCC;</li>
          <li>Fornecimento e instalação de XX (xxxxxxx) alertadores sonoros e visuais, sirene eletrônica tipo + estrobo;</li>
          <li>Fornecimento de materiais de infraestrutura seca: Condulete de alumínio 4"x4; Resistência de final de linha (47OHMS); Eletroduto de aço galvanizado, esmaltado antichama 3/4"; Fiação AF control 2x1,5mm² blindado com malha e dreno e indicação de laço; Fiação dos alertadores sonoro/visual 2x2,5mm²;</li>
          <li>Teste operacional de central de alarme.</li>
          </ul>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "SINALIZAÇÃO DE PREVENÇÃO DE INCÊNDIO E ORIENTAÇÃO": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação de XX (xxxxxxxx) sinalização de incêndio e orientação;</li>
        <li>Material fotoluminescente fabricadas de acordo com NBR-13434-1/2/3, anti-propagação;</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "SPDA – SISTEMA DE PROTEÇÃO CONTRA DESCARGAS ATMOSFÉRICAS": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação de SPDA com captação método de gaiola de Faraday com XX (xxxxx) captores, com XX (xxxxxx) descidas e XX (xxxxxxx) aterramentos, contemplando toda edificação, variável em função das dimensões da edificação com nível IV de proteção;</li>
        <li>Captação: barra chata de alumínio 5/8” x 1/8” e XX (xxxxxxx) captor H=300mm de aço Inoxidável;</li>
        <li>Descidas XX (xxxxxxx): Cabos de cobre nu # 35 mm2 e/ou barramento chato de alumínio 5/8” x 1/8” interconectas através do estrutural da edificação no telhado;</li>
        <li>Aterramento XX (xxxxx): com cabos de cobre nu # 50 mm2 enterrados a 0,5 m interligadas a hastes tipo copperweld, alta camada, de 5/8” x 2,4m. (para atender os memoriais de cálculos verificar o comprimento em cada edificação) em função da resistividade do solo, há casos com 3 m de profundidade e será necessário emendar uma haste na outra;</li>
        <li>Fornecimento e instalação de envelopamento das descidas com eletrodutos em PVC;</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>   
    </ul>
    </div>
`,
    "REDE DE SPRINKLERS": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <ul style="margin: 0; padding-left: 20px;">
        <li>Fornecimento e instalação da rede de canalização preventiva fixa de sprinklers com mão de obra especializada para instalação de tubulação de aço carbono DIN 2440 CL150 de 1” a x” com solda longitudinal ERW, rebarbas removidas, conforme ABNT NBR 5580 M, sem revestimento (PRETO), extremidades lisas, barras com 6 metros de comprimento pintadas na cor padrão vermelho;</li>
        <li>Fornecimento e instalação de XX (xxxxx) chuveiros automáticos sprinklers pendentes de 68°C ESFR 3/4” tipo K80;</li>
        <li>Fornecimento e instalação de conexões diversas;</li>
        <li>Fornecimento e instalação de canoplas nas instalações de bicos em forro;</li>
        <li>Fornecimento e instalação de válvulas e registro de 4” para fechamento por pavimento;</li>
        <li>Fornecimento e instalação de base de sustentação da tubulação;</li>
        <li>Envelopamento e pintura da tubulação nos trechos onde necessitar abertura de piso;</li>
        <li>Pressurização e testes finais da rede preventiva fixa de incêndio;</li>
        <li>De acordo com o projeto de incêndio aprovado junto ao CBMERJ.</li>
    </ul>
    </div>
`,
    "VENDA DE MATERIAIS E EQUIPAMENTOS": `
    <div style="font-family: Calibri; text-align: justify; font-size: 12px; line-height: 1.4;">
    <p>[INSERIR PLANILHA AQUI]</p>
    </div>
`,
  };

// Carregamento de clientes do banco de dados
async function carregarClientesDoBanco() {
    try {
        const res = await fetch('/api/clients');
        const clientes = await res.json();
        const select = document.getElementById('client-select');
        select.innerHTML = '<option value="">Selecionar cliente...</option>';
        mapaClientes = {}; // reset

        clientes.forEach(row => {
            mapaClientes[row.id] = {
                nome: row.nome,
                endereco: row.endereco || '',
                cnpj: row.cnpj || ''
            };
            const option = document.createElement('option');
            option.value = row.id;   // Agora o value é o id
            option.textContent = row.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }
}

// Event listener para seleção de cliente - SEMPRE atualiza com dados do banco
document.getElementById('client-select').addEventListener('change', function () {
    const selectedClient = this.value;
    const clientData = mapaClientes[selectedClient] || {};

    if (selectedClient && clientData.nome) {
        // SEMPRE sobrescreve com dados do banco (fonte única da verdade)
        document.getElementById('client-name').value = clientData.nome;
        document.getElementById('location-name').value = clientData.nome;
        document.getElementById('location-address').value = clientData.endereco || '';
        console.log(`✅ Cliente atualizado: ${clientData.nome}`);
    } else {
        // Limpa campos se nenhum cliente selecionado
        document.getElementById('client-name').value = '';
        document.getElementById('location-name').value = '';
        document.getElementById('location-address').value = '';
    }
    
    // O contato é sempre limpo ao trocar de cliente (só se não tiver valor)
    if (!document.getElementById('client-contact').value) {
        document.getElementById('client-contact').value = '';
    }
    
    // Atualiza a visualização automaticamente com o nome correto
    if (selectedClient && clientData.nome) {
        const clientContact = document.getElementById('client-contact').value;
        document.querySelector('.client-info').innerHTML = `
            <div style="line-height: 1;">À</div>
            <div style="line-height: 1;"><strong>${clientData.nome}</strong></div>
            <div style="line-height: 1;">A/C ${clientContact}</div>
        `;
    } else {
        document.querySelector('.client-info').innerHTML = '';
    }
});

// Atualiza visualização quando o contato do cliente muda
document.getElementById('client-contact').addEventListener('input', function () {
    const selectedClient = document.getElementById('client-select').value;
    const clientData = mapaClientes[selectedClient] || {};
    
    if (selectedClient && clientData.nome) {
        const clientContact = this.value;
        document.querySelector('.client-info').innerHTML = `
            <div style="line-height: 1;">À</div>
            <div style="line-height: 1;"><strong>${clientData.nome}</strong></div>
            <div style="line-height: 1;">A/C ${clientContact}</div>
        `;
    }
});

const addClientBtn          = document.getElementById('add-client-btn');
const clientSelectContainer = document.getElementById('client-select-container');
const clientSelect = document.getElementById('client-select');

// Função removida - usar modal de cadastro

// Função removida - usar modal de cadastro

// Função removida - usar modal de cadastro

const deleteClientBtn = document.getElementById('delete-client-btn');

deleteClientBtn.addEventListener('click', async function () {
    const selectedClientId = clientSelect.value;
    const selectedOption = clientSelect.options[clientSelect.selectedIndex];
    const selectedClient = selectedOption ? selectedOption.textContent : '';

    if (!selectedClientId) {
        alert('Selecione um cliente para excluir.');
        return;
    }
    if (!confirm(`Tem certeza que deseja excluir o cliente "${selectedClient}"? Essa ação não pode ser desfeita!`)) {
        return;
    }
    try {
        const res = await fetch(`/api/clients/id/${selectedClientId}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Cliente excluído com sucesso!');
            await carregarClientesDoBanco();
            clientSelect.value = '';
        } else if (res.status === 404) {
            alert('Cliente não encontrado.');
        } else {
            alert('Erro ao excluir cliente.');
        }
    } catch (e) {
        alert('Erro ao excluir cliente.');
    }
});

// Botão OK: confirma seleção de cliente existente
document.querySelectorAll('#client-ok-button').forEach(function (clientOkButton) {

  clientOkButton.addEventListener('click', async function () {

    /* ——— Fluxo: cliente já existente ——— */
    const selectedClient = clientSelect.value;
    if (!selectedClient) { alert('Por favor, selecione um cliente ou adicione um novo.'); return; }

    const clientData    = mapaClientes[selectedClient] || {};
    const clientContact = document.getElementById('client-contact').value;

    // SEMPRE sobrescreve com dados do banco (fonte única da verdade)
    document.getElementById('client-name').value      = clientData.nome || '';
    document.getElementById('location-name').value    = clientData.nome || '';
    document.getElementById('location-address').value = clientData.endereco || '';

    // Usa sempre o nome do banco de dados
    const clientName = clientData.nome || '';
    document.querySelector('.client-info').innerHTML = `
    <div style="line-height: 1;">À</div>
    <div style="line-height: 1;"><strong>${clientName}</strong></div>
    <div style="line-height: 1;">A/C ${clientContact}</div>
    `;

    updatePreview();
  });

});

// Inicialização do aplicativo
document.addEventListener('DOMContentLoaded', function () {
    // ====== LOADER SIMPLES NO BOTÃO (não precisa inicialização) ======

    // --- FONTE CALIBRI DISPONÍVEL NO PICKER (Temporariamente desativado para corrigir erro) ---
    // const Font = Quill.import('formats/font');
    // Font.whitelist = ['Calibri', 'sans-serif', 'serif', 'monospace'];
    // Quill.register(Font, true);

  const overlay = document.getElementById('login-overlay');
  const loginInput = document.getElementById('login-name');
  const loginBtn = document.getElementById('login-btn');
  const userField = document.getElementById('proposal-user');
  const switchBtn = document.getElementById('switch-user-btn');

  function finishLogin(name) {
    localStorage.setItem('ffUser', name);
    userField.value = name;
    userField.readOnly = true;
    overlay.style.display = 'none';
  }

  function showLogin() {
    overlay.style.display = 'flex';
    loginInput.value = '';
    setTimeout(() => loginInput.focus(), 100);
    userField.value = '';
    userField.readOnly = false;
  }

  loginBtn.onclick = function () {
    const name = loginInput.value.trim();
    if (!name) {
      alert('Digite seu nome.');
      loginInput.focus();
      return;
    }
    finishLogin(name);
  };

  loginInput.onkeydown = function (e) {
    if (e.key === 'Enter') loginBtn.click();
  };
 
  document.querySelectorAll('.project-option').forEach(cb => {
  cb.addEventListener('change', () => {
    // Apenas atualiza visualização, não salva automaticamente
  });
  });  

  // Troca usuário ao clicar SEM esconder o botão
  if (switchBtn) {
    switchBtn.onclick = function() {
      localStorage.removeItem('ffUser');
      showLogin();
    };
  }

  // Inicialização automática
  const storedName = localStorage.getItem('ffUser');
  if (!storedName) {
    showLogin();
  } else {
    finishLogin(storedName);
  }

    const savedProposalsModal = new bootstrap.Modal(document.getElementById('savedProposalsModal'));

    document.getElementById('open-saved-proposals').addEventListener('click', async () => {
    const listContainer = document.getElementById('saved-proposals-list');
    listContainer.innerHTML = '';

let dados = [];
try {
  const res = await fetch('/api/proposals');
  if (!res.ok) throw new Error('Falha na API');
  dados = await res.json();                   // ← array vindo do servidor
} catch (err) {
  console.error(err);
  listContainer.innerHTML =
    '<li class="list-group-item text-danger">Erro ao carregar propostas.</li>';
  savedProposalsModal.show();
  return;
}

if (dados.length === 0) {
  listContainer.innerHTML =
    '<li class="list-group-item text-muted">Nenhuma proposta salva.</li>';
  savedProposalsModal.show();
  return;
}

dados.forEach(dados => {
  const item = document.createElement('li');
  const nomeCliente = (mapaClientes[dados.cliente] || {}).nome || dados.cliente;
  item.className = item.className = 'list-group-item d-flex align-items-start position-relative';

    item.innerHTML = `
    <!-- checkbox de seleção -->
    <input class="form-check-input me-2 select-proposal"
            type="checkbox" value="${dados.numero}">

    <!-- texto da proposta -->
    <div class="flex-grow-1">
        <div>
        <strong>${dados.numero}</strong> – ${dados.tipo}
        ${dados.cliente ? ' | <span style="color:#007bff">' + nomeCliente + '</span>' : ''}
        </div>
        <div class="text-muted">${dados.referencia || '(Sem referência)'}</div>
        <div class="text-muted small">Responsável: <strong>${dados.usuario || '-'}</strong></div>
    </div>

    <!-- grupo de botões, colado à direita -->
    <div class="position-absolute top-0 end-0 d-flex">
        <button title="Carregar"
                class="icon-btn btn-outline-primary me-1"
                data-load="${dados.numero}">
        <svg width="18" height="18" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 5v14m7-7H5" />
        </svg>
        </button>

        <button title="Duplicar"
                class="icon-btn btn-outline-success me-1"
                data-duplicate="${dados.numero}">
        <svg width="18" height="18" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <rect x="3" y="3" width="13" height="13" rx="2" />
        </svg>
        </button>

        <button title="Excluir"
                class="icon-btn btn-outline-danger"
                data-delete="${dados.numero}">
        <svg width="18" height="18" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        </button>
    </div>
    `;


  listContainer.appendChild(item);
});

savedProposalsModal.show();

    });

    // Função para carregar uma proposta no formulário
    function carregarProposta(dados) {

        // 1. Define a ordem correta dos serviços a partir dos dados salvos.
        // Usa a ordem salva se existir, senão cria uma a partir dos serviços marcados (fallback).
        if (dados.ordemServicos && dados.ordemServicos.length > 0) {
            selectedServiceOrder = dados.ordemServicos;
        } else {
            selectedServiceOrder = dados.servicos
                .filter(s => s.checked)
                .map(s => s.id);
        }

        // 2. Preenche os campos de texto e seletores da proposta.
        document.getElementById('proposal-user').value = dados.usuario || '';
        document.getElementById('proposal-number').value = dados.numero;
        document.getElementById('proposal-type').value = dados.tipo;
        document.getElementById('company-selector').value = dados.empresa;
        document.getElementById('proposal-reference').value = dados.referencia;
        
        // VALIDAÇÃO DE CLIENTE: Verifica se o cliente ainda existe no banco
        const clienteExiste = mapaClientes[dados.cliente];
        if (clienteExiste) {
            // Cliente válido - carrega do banco
            document.getElementById('client-select').value = dados.cliente;
            document.getElementById('client-name').value = clienteExiste.nome;
            document.getElementById('location-name').value = clienteExiste.nome;
            document.getElementById('location-address').value = clienteExiste.endereco || '';
        } else {
            // Cliente não existe mais - limpa campos e avisa
            document.getElementById('client-select').value = '';
            document.getElementById('client-name').value = '';
            document.getElementById('location-name').value = '';
            document.getElementById('location-address').value = '';
            
            if (dados.clienteNome) {
                console.warn(`⚠️ Cliente "${dados.clienteNome}" não existe mais no banco. Por favor, selecione um cliente válido.`);
                setTimeout(() => {
                    alert(`Atenção: O cliente "${dados.clienteNome}" não existe mais no banco de dados.\n\nPor favor, selecione um cliente válido na lista para continuar.`);
                }, 500);
            }
        }
        
        document.getElementById('client-contact').value = dados.contato;
        document.getElementById('preambleDescription').value = dados.preambulo;
        document.getElementById('objectDescription').value = dados.objeto;
        document.getElementById('observationsDescription').value = dados.observacoes;
        document.getElementById('clarificationsDescription').value = dados.esclarecimentos;
        document.getElementById('budgetDescription').value = dados.orcamento || '';

        // 3. Limpa o estado visual de todos os checkboxes de serviço antes de aplicar os novos dados.
        document.querySelectorAll('.project-option').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
            delete cb.dataset.description;
            const label = cb.closest('.form-check').querySelector('label');
            if (label) {
                label.style.fontWeight = 'normal';
                label.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.remove());
            }
        });

        // 4. Restaura o estado de cada serviço (marcado, descrição e botões de ação).
        if (Array.isArray(dados.servicos)) {
            dados.servicos.forEach(servico => {
                const cb = document.getElementById(servico.id);
                if (!cb) return;

                cb.checked = servico.checked;
                if (servico.descricao) {
                    cb.dataset.description = servico.descricao;
                }

                if (servico.checked) {
                    cb.disabled = true;
                    const label = cb.closest('.form-check').querySelector('label');
                    label.style.fontWeight = 'bold';

                    // Adiciona o botão de editar
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

                    // Adiciona o botão de excluir
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'X';
                    deleteBtn.className = 'btn btn-sm btn-danger delete-btn ms-1';
                    deleteBtn.title = 'Excluir este item';
                    deleteBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Desfaz a seleção do serviço
                        cb.checked = false;
                        cb.disabled = false;
                        delete cb.dataset.description;
                        label.style.fontWeight = 'normal';
                        
                        // Remove o item da lista de ordem
                        selectedServiceOrder = selectedServiceOrder.filter(id => id !== cb.id);
                        
                        // Remove os botões
                        editBtn.remove();
                        deleteBtn.remove();
                        
                        // Atualiza a visualização
                        updatePreview();
                    });
                    label.appendChild(deleteBtn);
                }
            });
        }

        // 5. Atualiza o cabeçalho da empresa com base no seletor.
        const selectedCompany = document.getElementById('company-selector').value;
        generateHeader(selectedCompany);

        // 6. Atualiza as informações do cliente no visualizador - SEMPRE do banco
        const clienteValido = mapaClientes[dados.cliente];
        const clienteName = clienteValido ? clienteValido.nome : '';
        const clienteContact = dados.contato || '';
        
        if (clienteName) {
            document.querySelector('.client-info').innerHTML = `
                <div style="line-height: 1;">À</div>
                <div style="line-height: 1;"><strong>${clienteName}</strong></div>
                <div style="line-height: 1;">A/C ${clienteContact}</div>
            `;
        } else {
            // Se cliente não existe mais, limpa o visualizador
            document.querySelector('.client-info').innerHTML = `
                <div style="line-height: 1; color: #dc3545;">Cliente não encontrado no banco</div>
                <div style="line-height: 1; color: #6c757d; font-size: 0.9em;">Selecione um cliente válido</div>
            `;
        }

        // 7. Atualiza a visualização da proposta para refletir os dados carregados.
        updatePreview();
        
        // 8. Estado carregado com sucesso
    }

    async function updateProposalNumber() {
        console.log('🚀 updateProposalNumber() INICIOU');
        
        // ✅ CORREÇÃO: Sempre pega o valor atual do selector, não um valor cached
        const company = document.getElementById('company-selector').value;
        const prefix  = company === 'forfire2' ? 'FFP' : 'FFS';

        console.log(`🏢 Empresa atual no DOM: "${company}" → Prefixo: "${prefix}"`);

        try {
            console.log(`📡 Fazendo fetch para: /api/next-number?prefix=${prefix}`);
            
            const res = await fetch(`/api/next-number?prefix=${prefix}`);
            console.log(`📡 Response status: ${res.status}`);
            
            const data = await res.json();
            console.log(`📡 Response data:`, data);
            
            const { numero } = data;
            const field = document.getElementById('proposal-number');
            
            console.log(`📝 Número recebido: "${numero}"`);
            console.log(`📝 Campo encontrado:`, field);
            console.log(`📝 Valor atual do campo: "${field ? field.value : 'CAMPO NÃO ENCONTRADO'}"`);
            
            if (field) {
                console.log(`📝 Atualizando campo de "${field.value}" para "${numero}"`);
                
                // Atualiza TANTO a propriedade JavaScript quanto o atributo HTML
                field.value = numero;
                field.setAttribute('value', numero);
                field.style.backgroundColor = '#eee';
                
                // Força um re-render
                field.dispatchEvent(new Event('input', { bubbles: true }));
                
                console.log(`📝 Valor após atualização: "${field.value}"`);
                console.log(`✅ FUNÇÃO TERMINADA - Valor final: "${field.value}"`);
            } else {
                console.error('❌ Campo proposal-number não encontrado!');
            }
            
        } catch (err) {
            console.error('❌ Erro ao buscar próximo número:', err);
            // fallback local
            const year = new Date().getFullYear();
            const fallbackValue = `${prefix}-01-${year}`;
            console.log(`📝 Usando fallback: "${fallbackValue}"`);
            
            const field = document.getElementById('proposal-number');
            if (field) {
                field.value = fallbackValue;
            }
        }
    }

    // Carregar clientes
    carregarClientesDoBanco();

    
    // Event delegation – carregar, duplicar ou excluir
    document.getElementById('saved-proposals-list')
            .addEventListener('click', async function (e) {

    // garante que peguemos sempre o <button>, não o <svg>
    const btn = e.target.closest('button');
    if (!btn) return;

    /* ───────── 1. CARREGAR ───────── */
    if (btn.dataset.load) {
        const numero = btn.dataset.load;
        try {
        const dados = await fetch('/api/proposals/' + numero).then(r => r.json());
        carregarProposta(dados);
        savedProposalsModal.hide();
        } catch (err) {
        alert('Erro ao carregar proposta.');
        console.error(err);
        }
    }

    /* ───────── 2. DUPLICAR ───────── */
    if (btn.dataset.duplicate) {
        const numeroOrig = btn.dataset.duplicate;
        try {
        // pega a proposta original
        const dados = await fetch('/api/proposals/' + numeroOrig).then(r => r.json());

        // pede ao servidor o próximo número
        const { numero: novoNumero } = await fetch(`/api/next-number?prefix=${(dados.empresa === 'forfire2' ? 'FFP' : 'FFS')}`).then(r => r.json());

        // ajusta número e salva como nova
        dados.numero = novoNumero;
        await fetch('/api/proposals', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ numero: novoNumero, data: dados })
        });

        alert(`Proposta duplicada como ${novoNumero}`);
        carregarProposta(dados);          // já carrega no formulário
        savedProposalsModal.hide();
        } catch (err) {
        alert('Erro ao duplicar proposta.');
        console.error(err);
        }
    }

    /* ───────── 3. EXCLUIR ───────── */
    if (btn.dataset.delete) {
        const numero = btn.dataset.delete;
        if (!confirm('Deseja realmente excluir esta proposta?')) return;
        try {
        await fetch('/api/proposals/' + numero, { method: 'DELETE' });
        btn.closest('li').remove();
        } catch (err) {
        alert('Erro ao excluir proposta.');
        console.error(err);
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
    deleteBtn.addEventListener('click', async () => {
        const selecionadas = list.querySelectorAll('.select-proposal:checked');
        if (selecionadas.length === 0) return;

        if (!confirm(`Deseja realmente excluir ${selecionadas.length} proposta(s)?`)) return;

        for (const cb of selecionadas) {
             const numero = cb.value;
             await fetch('/api/proposals/' + numero, { method: 'DELETE' });
             cb.closest('li').remove();
        }

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

/* ───────── RESET PROPOSAL ───────── */
function resetProposal({ skipSave = false, keepUser = true } = {}) {

  ignoreNextChange    = true;      // bloqueia listeners enquanto limpa
  proposalReadyToSave = false;     // evita salvar proposta vazia

  // Limpa campos de texto/textarea
  [
    'proposal-reference',
    'client-contact',
    'preambleDescription',
    'objectDescription',
    'observationsDescription',
    'clarificationsDescription',
    'budgetDescription'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = '';
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Para selects, atribua valor padrão
  const clientSelect = document.getElementById('client-select');
  if (clientSelect) {
    clientSelect.value = '';
    clientSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  document.getElementById('company-selector').value = 'forfire1';
  document.getElementById('proposal-type').value    = 'Proposta Comercial';

  // Limpa serviços
  document.querySelectorAll('.project-option').forEach(cb => {
    cb.checked = false;
    cb.disabled = false;
    delete cb.dataset.description;
    const label = cb.closest('.form-check').querySelector('label');
    if (label) {
    label.style.fontWeight = 'normal';
    label.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.remove());
    }
  });

  updatePreview();          // mostra layout vazio (não salva)

  ignoreNextChange = false; // libera listeners para uso normal

  // Não salva automaticamente - apenas quando usuário clicar 'Salvar'
}

    // Função para exibir mensagem "Proposta atualizada!" abaixo de um campo
    function showUpdateMessage(field) {
        if (ignoreNextChange) return;      // ← NOVO: sai se estivermos em reset

        const parent = field.parentElement;
        parent.querySelector('.update-msg')?.remove();

        const msg = document.createElement('div');
        msg.textContent = 'Proposta atualizada!';
        msg.className   = 'update-msg';
        msg.style.cssText = 'color:#28a745;font-size:.8em';
        parent.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);

        updatePreview();
    }

    // Função auxiliar para anexar listeners de atualização a um campo
    function attachUpdateMessage(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.addEventListener('change', () => showUpdateMessage(field));
        field.addEventListener('blur', () => showUpdateMessage(field));
    }

    // Anexa o listener para os campos desejados (pode-se aumentar conforme necessário)
    ['proposal-user', 'proposal-reference', 'client-contact', 'company-selector', 'proposal-type']
  .forEach(id => {
        attachUpdateMessage(id);
    });

    document.getElementById('proposal-user').addEventListener('blur', () => {
    updateProposalNumber();
    });

    /* ───────── NOVA PROPOSTA ───────── */
    document.getElementById('nova-proposta').addEventListener('click', async () => {
        if (!confirm("Deseja realmente iniciar uma nova proposta?")) return;
        updatePreview();       // garante que proposalReadyToSave está correto
        // Nova proposta iniciada
        resetProposal({ skipSave: true });     // ① limpa tudo (flag de salvamento = false)
        await updateProposalNumber();          // ② agora gera o Nº com o prefixo em vigor
    });


    // Listener para o botão "LIMPAR"
    document.getElementById('limpar-proposta').addEventListener('click', function(){
        if (confirm("Deseja realmente limpar a proposta?")) {
            // Chama a função de reset, mantendo o mesmo número de proposta
            resetProposal();
        }
        // Se o usuário escolher "NÃO", não faz nada.
    });
    

    // Listener para o botão de edição do número da proposta
    document.getElementById('toggle-edit-number').addEventListener('click', async function() {
        const input = document.getElementById('proposal-number');
        const statusMsg = document.getElementById('proposal-status-msg');
        const button = this;

        if (input.hasAttribute('readonly')) {
            // Modo edição: remove readonly, fundo branco, limpa mensagem, altera texto do botão para "Salvar"
            input.removeAttribute('readonly');
            input.style.backgroundColor = "#fff";
            statusMsg.innerText = "";
            button.textContent = "Salvar";
        } else {
            // Modo salvo (tentativa)
            const proposalValue = input.value.trim();

            // Validação de formato
            if (!/^FF[PS]-\d{2}-\d{4}$/.test(proposalValue)) {
                statusMsg.innerHTML = "Formato inválido! Use FF(P/S)-XX-YYYY.";
                statusMsg.style.color = 'red';
                setTimeout(() => { statusMsg.innerHTML = ''; }, 3000);
                return;
            }

            // Desabilita o botão para evitar cliques duplos
            button.disabled = true;

            try {
                // Verifica se a proposta já existe no servidor
                const res = await fetch(`/api/proposals/${proposalValue}`);

                if (res.ok) {
                    // Se res.ok for true, a proposta com este número já existe.
                    alert(`O número de proposta "${proposalValue}" já está em uso. Por favor, escolha outro.`);
                    input.focus(); // Mantém o campo em modo de edição para correção
                } else if (res.status === 404) {
                    // 404 Not Found: Ótimo! O número está disponível.
                    input.setAttribute('readonly', true);
                    input.style.backgroundColor = "#eee";
                    button.textContent = "Editar";
                    statusMsg.innerHTML = `Proposta <strong>${proposalValue}</strong> salva com sucesso!`;
                    statusMsg.style.color = 'green';

                    clearTimeout(statusMsg._hideTimer);
                    statusMsg._hideTimer = setTimeout(() => {
                        statusMsg.innerHTML = '';
                    }, 2000);

                    // Número da proposta atualizado
                } else {
                    // Outros erros de servidor
                    alert('Erro ao verificar o número da proposta. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro de rede ao verificar proposta:', error);
                alert('Erro de rede. Verifique sua conexão e tente novamente.');
            } finally {
                // Reabilita o botão após a operação
                button.disabled = false;
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
            nome    : "FORFIRE Serviços e Comércio",
            endereco: "Av. Camões, 611<br>Penha Circular / RJ – CEP: 21011-510",
            cnpj    : "CNPJ: 18.739.222/0001-96 / Inscrição Estadual: 79.995.681"
        },
        forfire2: {
            nome    : "FORFIRE Prevenção de Incêndio",
            endereco: "Av. Embaixador Abelardo Bueno, 3500 – Sala 820 – Ed. Vision Offices<br>Barra da Tijuca / RJ – CEP: 22775-040",
            cnpj    : "CNPJ: 23.211.427/0001-34 / Inscrição Estadual: 87.017.290"
        }
    };

    // Função para gerar o cabeçalho dinamicamente
    function generateHeader(companyKey) {
        const company = companyData[companyKey] || companyData.forfire1;
        const headerElement = document.getElementById('dynamic-header');
        
        headerElement.innerHTML = `
            <div class="header-left">
                <img src="logo48.jpg" alt="Logo da FORFIRE" style="max-height: 60px; width: auto; display: block;">
                <div class="text-start">
                    <div id="preview-company-name">${company.nome}</div>
                    <div id="preview-company-address">${company.endereco}</div>
                    <div id="preview-company-cnpj">${company.cnpj}</div>
                </div>                                                      
            </div>
            <div class="header-right">
                <div>Fone (21) 97031-6310 | 3988-1700</div>
                <div>www.forfire.com.br | @eusouforfire</div>
            </div>
        `;
    }

    const companySelector = document.getElementById('company-selector');
    companySelector.addEventListener('change', async function () {
        const selected = this.value;                     // forfire1 ou forfire2

        console.log(`🏢 Empresa mudou para: ${selected}`);

        /* 1. Cabeçalho ------------------------------------------------ */
        generateHeader(selected);

        /* 2. Número da proposta -------------------------------------- */
        const numField   = document.getElementById('proposal-number');
        const current    = numField.value.trim();        // p.ex. "FFS-02-2025"
        const newPrefix  = selected === 'forfire2' ? 'FFP' : 'FFS';

        console.log(`🔄 Mudando prefixo para: ${newPrefix}`);
        console.log(`📝 Número atual: "${current}"`);

        // ✅ CORREÇÃO: Sempre busca o próximo número disponível para o novo prefixo
        // ao invés de tentar preservar a sequência do prefixo antigo
        try {
            console.log(`📡 Buscando próximo número para prefixo: ${newPrefix}`);
            await updateProposalNumber(); // Esta função já usa o valor atual do selector
            console.log(`✅ Número atualizado para: ${numField.value}`);
        } catch (error) {
            console.error('❌ Erro ao atualizar número:', error);
            // Fallback manual se der erro
            const year = new Date().getFullYear();
            numField.value = `${newPrefix}-01-${year}`;
            console.log(`🔧 Fallback aplicado: ${numField.value}`);
        }

        /* 3. Refresca visualização ----------------------------------- */
        updatePreview();
        
        // 4. Empresa alterada
    });

    // Inicializa a empresa selecionada
    companySelector.dispatchEvent(new Event('change'));

    // Inicializa os editores Quill
    quillObject = new Quill('#quillObjectEditor', {
        theme: 'snow',
        placeholder: 'Digite o conteúdo do Objeto...',
        modules: {
            toolbar: [
                [{ font: ['calibri', 'arial', 'times-new-roman'] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: ['justify'] }],
                ['clean']
            ]
        }
    });
    enableTablePaste(quillObject);

    quillPreamble = new Quill('#quillPreambleEditor', {
        theme: 'snow',
        placeholder: 'Digite o preâmbulo da proposta...',
        modules: {
            toolbar: [
                [{ font: ['calibri', 'arial', 'times-new-roman'] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: ['justify'] }],
                ['clean']
            ]
        }
    });
    enableTablePaste(quillPreamble);

    quillProject = new Quill('#quillProjectEditor', {
        theme: 'snow',
        placeholder: 'Digite a descrição do serviço...',
        modules: {
            toolbar: [
                [{ font: ['calibri', 'arial', 'times-new-roman'] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: ['justify'] }],
                ['clean']
            ]
        }
    });
    
    enableTablePaste(quillProject);     // 🆕

    quillObservations = new Quill('#quillObservationsEditor', {
        theme: 'snow',
        placeholder: 'Digite as observações...',
        modules: {
            toolbar: [
                [{ font: ['calibri', 'arial', 'times-new-roman'] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: ['justify'] }],
                ['clean']
            ]
        }
    });
    enableTablePaste(quillObservations);
    
    quillClarifications = new Quill('#quillClarificationsEditor', {
        theme: 'snow',
        placeholder: 'Digite os esclarecimentos...',
        modules: {
            toolbar: [
                [{ font: ['calibri', 'arial', 'times-new-roman'] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: ['justify'] }],
                ['clean']
            ]
        }
    });
    enableTablePaste(quillClarifications);

    quillBudget = new Quill('#quillBudgetEditor', {
        theme: 'snow',
        placeholder: 'Digite o texto do orçamento...',
        modules: {
            toolbar: [
                [{ font: ['calibri', 'arial', 'times-new-roman'] }, { size: [] }],
                ['bold', 'italic', 'underline'],
                [{ color: [] }],
                [{ align: ['justify'] }],
                ['clean']
            ]
        }
    });
    enableTablePaste(quillBudget);

    // ---------------- TABELA → IMAGEM ----------------
    /**
    * Converte trechos HTML em PNG usando html2canvas e devolve o dataURL.
    * @param {String} htmlContent - fragmento HTML a renderizar
    * @returns {Promise<String>}  - base64 do PNG
    */
    function htmlToPng(htmlContent) {
        return new Promise((resolve) => {
            const holder = document.createElement('div');
            holder.style.position = 'absolute';
            holder.style.left = '-9999px';
            holder.style.top = '-9999px';
            holder.style.fontFamily = 'Arial, sans-serif';
            holder.style.fontSize = '12px';
            holder.innerHTML = htmlContent;
            document.body.appendChild(holder);

            // Configurações do html2canvas para controlar tamanho
            const options = {
                useCORS: true,
                allowTaint: true,
                scale: 1,
                width: Math.min(holder.scrollWidth, 750), // Máximo 750px de largura
                height: Math.min(holder.scrollHeight, 900), // Máximo 900px de altura
                backgroundColor: '#ffffff'
            };

            html2canvas(holder, options).then(canvas => {
                document.body.removeChild(holder);
                
                // Se a imagem ainda for muito grande, redimensiona proporcionalmente
                const maxWidth = 750;  // Largura máxima para A4 (considerando margens de 15mm)
                const maxHeight = 900; // Altura máxima para evitar quebra de página
                
                if (canvas.width > maxWidth || canvas.height > maxHeight) {
                    const resizedCanvas = document.createElement('canvas');
                    const ctx = resizedCanvas.getContext('2d');
                    
                    // Calcula proporção mantendo aspect ratio
                    const widthRatio = maxWidth / canvas.width;
                    const heightRatio = maxHeight / canvas.height;
                    const ratio = Math.min(widthRatio, heightRatio);
                    
                    resizedCanvas.width = canvas.width * ratio;
                    resizedCanvas.height = canvas.height * ratio;
                    
                    // Desenha a imagem redimensionada
                    ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
                    resolve(resizedCanvas.toDataURL('image/png', 0.95)); // Compressão 95%
                } else {
                    resolve(canvas.toDataURL('image/png', 0.95));
                }
            }).catch(error => {
                document.body.removeChild(holder);
                console.error('Erro ao gerar PNG:', error);
                resolve(''); // Retorna string vazia em caso de erro
            });
        });
    }

    /*** Registra o listener de paste no Quill para transformar <table> em <img> */
    function enableTablePaste(quill) {
        console.log('🔧 Habilitando paste de tabelas para editor Quill');
        
        quill.root.addEventListener(
            'paste',
            async (e) => {
                console.log('📋 Evento paste detectado', e);
                try {
                    const clipboardData = e.clipboardData || window.clipboardData;
                    const html = clipboardData.getData('text/html');
                    const text = clipboardData.getData('text/plain');
                    
                    console.log('📄 Dados HTML:', html ? 'Presente' : 'Ausente');
                    console.log('📝 Dados texto:', text ? `${text.length} chars` : 'Ausente');
                    
                    // Verifica se há tabela HTML (Excel geralmente cria este formato)
                    if (html && /<table[\s\S]*?<\/table>/i.test(html)) {
                        console.log('✅ Tabela HTML detectada, processando...');
                        e.preventDefault();
                        
                        if (typeof html2canvas === 'undefined') {
                            console.error('❌ html2canvas não está disponível');
                            return;
                        }
                        
                        const dataUrl = await htmlToPng(html);
                        if (dataUrl) {
                            const range = quill.getSelection(true);
                            if (range) {
                                console.log('🖼️ Inserindo imagem na posição:', range.index);
                                quill.insertEmbed(range.index, 'image', dataUrl, 'user');
                                quill.setSelection(range.index + 1);
                            }
                        }
                        return;
                    }
                    
                    // Tenta também dados de texto tabulados (TSV)
                    if (text && text.includes('\t')) {
                        console.log('✅ Dados tabulados detectados, processando...');
                        e.preventDefault();
                        await handleTsvData(quill, text);
                        return;
                    }
                    
                    console.log('ℹ️ Nenhuma tabela detectada, permitindo paste normal');
                } catch (error) {
                    console.error('❌ Erro ao processar dados da planilha:', error);
                    // Em caso de erro, deixa o Quill processar normalmente
                }
            },
            /* capture = */ true
        );
        
        // Adiciona listener adicional no container do quill como fallback
        quill.container.addEventListener('paste', (e) => {
            console.log('📋 Paste detectado no container do Quill');
        }, true);
    }

    // Função auxiliar para processar dados TSV (Tab-Separated Values)
    async function handleTsvData(quill, text) {
        try {
            // Converte TSV para HTML table
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length === 0) return;

            let htmlTable = '<table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">';
            
            lines.forEach((line, index) => {
                const cells = line.split('\t');
                htmlTable += '<tr>';
                cells.forEach(cell => {
                    const tag = index === 0 ? 'th' : 'td';
                    htmlTable += `<${tag} style="padding: 4px; border: 1px solid #ccc;">${cell.trim()}</${tag}>`;
                });
                htmlTable += '</tr>';
            });
            
            htmlTable += '</table>';

            // Converte para PNG
            const dataUrl = await htmlToPng(htmlTable);

            // Insere a imagem
            const range = quill.getSelection(true);
            if (range) {
                quill.insertEmbed(range.index, 'image', dataUrl, 'user');
                quill.setSelection(range.index + 1);
            }
        } catch (error) {
            console.error('Erro ao processar dados TSV:', error);
        }
    }

    
    // Adicione o event listener para o botão de edição do orçamento
    document.getElementById('edit-budget').addEventListener('click', () => {
        const defaultHtml = `Para a execução total dos serviços acima descritos, juntamente com material, equipamentos e mão de obra especializada, dar-se a importância de R$ [VALOR], com todos os impostos e encargos inclusos.`;
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
        const defaultHtml = `<p>A <b>FORFIRE</b> vem apresentar sua proposta de serviços [DESCREVER], descritos no corpo desta, em\n        conformidade com COSCIP (Código de Segurança contra Incêndio e Pânico - CBMERJ), normas técnicas e \n        legislação brasileira.</p>`;
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

    // 🆕 controla a sequência de marcação e remoção
    if (this.checked) {
        if (!selectedServiceOrder.includes(this.id)) {
            selectedServiceOrder.push(this.id); // adiciona ao fim
        }
    } else {
        // remove da lista caso desmarque
        selectedServiceOrder = selectedServiceOrder.filter(id => id !== this.id);
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
    function isHtmlTrulyEmpty(html) {
        // Verifica se tem imagens
        const hasImages = /<img[\s\S]*?>/gi.test(html);
        if (hasImages) return false;  // Se tem imagem, não está vazio
        
        // Se não tem imagem, verifica texto como antes
        const texto = html.replace(/<(.|\n)*?>/g, '').trim();
        return texto.length === 0;
    }

    document.getElementById('confirmProjectDescription').addEventListener('click', function () {
        const currentProjectId = document.getElementById('currentProjectId').value;
        const checkbox = document.getElementById(currentProjectId);
        const label = checkbox.closest('.form-check').querySelector('.form-check-label');
        const rawHtml = quillProject.root.innerHTML.trim();
    
        if (isHtmlTrulyEmpty(rawHtml)) {
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
    
        checkbox.dataset.description = rawHtml;   // mantém imagem/planilha
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
    document.getElementById('proposal-ok-button')
            .addEventListener('click', () => {
                updateProposalHeader();
                updateReferenceSection();
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

    // Atualizar visualização da proposta
function updatePreview() {
    /* ――― 1. Cabeçalho: data ――― */
    const dataAtual   = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR', {
        day:   '2-digit',
        month: 'long',
        year:  'numeric'
    });
    document.getElementById('preview-proposal-date').textContent =
        `Rio de Janeiro, ${dataFormatada}`;

    /* ――― 2. Textos digitados ――― */
    const preambleText = document.getElementById('preambleDescription').value;
    const obj          = document.getElementById('objectDescription').value;
    const obs          = document.getElementById('observationsDescription').value;
    const esc          = document.getElementById('clarificationsDescription').value;
    const budgetText   = document.getElementById('budgetDescription').value;

    /* ――― 3. Conteúdo mínimo para salvar ――― */
    const hasContent =
          preambleText.trim()       ||
          obj.trim()                ||
          obs.trim()                ||
          esc.trim()                ||
          budgetText.trim()         ||
          selectedServiceOrder.length > 0;

    proposalReadyToSave = !!hasContent;

    /* ――― 4. Cabeçalho e referência ――― */
    updateProposalHeader();
    updateReferenceSection();

    document.getElementById('proposal-content').classList.remove('hidden');

    /* ――― 5. PREÂMBULO ――― */
    const previewPreamble = document.getElementById('preview-preamble');
    previewPreamble.innerHTML = '';

    if (preambleText.trim()) {
        const corpo = document.createElement('div');
        corpo.innerHTML     = preambleText;
        corpo.style.textAlign = 'justify';
        previewPreamble.appendChild(corpo);
    }

    /* ――― 6. OBJETO ――― */
    const previewObject = document.getElementById('preview-object');
    previewObject.innerHTML = '';

    if (obj.trim()) {
        const titulo = document.createElement('div');
        titulo.className = 'section-title';
        titulo.textContent =
            '1. OBJETO - COMPOSIÇÕES DO SISTEMA DE PREVENÇÃO E COMBATE A INCÊNDIO';
        previewObject.appendChild(titulo);

        const corpo = document.createElement('div');
        let objComLetras = obj
            .replace('<ol>', '<ol type="a">')
            .replace(
                /<p[^>]*>\s*<strong>(10\\.? NORMAS UTILIZADAS)<\/strong>\s*<\/p>/i,
                '<div style="font-weight: bold; margin-bottom: 0;">$1</div>'
            )
            .replaceAll('<ul>', '<ul style="margin-left: 30px; padding-left: 20px;">')
            .replaceAll('<pre>', '').replaceAll('<\/pre>', '');

        corpo.innerHTML      = objComLetras;
        corpo.style.textAlign = 'justify';
        previewObject.appendChild(corpo);
    }

    /* ――― 7. SERVIÇOS (Escopo) ――― */
    updateProjects();

    /* ――― 8. OBSERVAÇÕES ――― */
    const previewObservations = document.getElementById('preview-observations');
    previewObservations.innerHTML = '';

    if (obs.trim()) {
        const titulo = document.createElement('div');
        titulo.className = 'section-title';
        titulo.textContent = 'OBSERVAÇÕES';
        previewObservations.appendChild(titulo);

        const corpo = document.createElement('div');
        corpo.innerHTML      = obs;
        corpo.style.textAlign = 'justify';
        previewObservations.appendChild(corpo);
    }

    /* ――― 9. ESCLARECIMENTOS ――― */
    const previewClarifications = document.getElementById('preview-clarifications');
    previewClarifications.innerHTML = '';

    if (esc.trim()) {
        const titulo = document.createElement('div');
        titulo.className = 'section-title';
        titulo.textContent = 'ESCLARECIMENTOS';
        previewClarifications.appendChild(titulo);

        const corpo = document.createElement('div');
        corpo.innerHTML      = esc;
        corpo.style.textAlign = 'justify';
        previewClarifications.appendChild(corpo);
    }

    /* ――― 10. VALOR DO SERVIÇO ――― */
    let budgetContainer = document.getElementById('budget-section');
    if (!budgetContainer) {
        budgetContainer = document.createElement('div');
        budgetContainer.id = 'budget-section';
        document.getElementById('preview-projects-wrapper').after(budgetContainer);
    }

    if (budgetText.trim()) {
        budgetContainer.innerHTML =
            `<p class="section-title">VALOR TOTAL ${budgetText}</p>`;
        budgetContainer.style.display = 'block';
    } else {
        budgetContainer.style.display = 'none';
    }
}


// Função para atualizar os projetos (serviços) na visualização
function updateProjects() {
    const projectsWrapper = document.getElementById('preview-projects-wrapper');
    projectsWrapper.innerHTML = '';

    // Monta a lista na ordem em que o usuário marcou os serviços
    const selectedProjects = selectedServiceOrder
        .map(id => document.getElementById(id))
        .filter(cb => cb && cb.checked);

    // Se nenhum serviço estiver marcado, encerra a função
    if (selectedProjects.length === 0) return;

    // Adiciona o título geral da seção de projetos
    const tituloEscopo = document.createElement('div');
    tituloEscopo.className = 'section-title';
    tituloEscopo.textContent = '2. ESCOPO DESTA PROPOSTA - SOLUÇÕES TÉCNICAS GLOBAIS';
    projectsWrapper.appendChild(tituloEscopo);

    // Para cada serviço marcado, cria a estrutura de exibição na ordem em que foi marcado
    selectedProjects.forEach((project, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'proposal-item-wrapper';
        wrapper.style.breakInside = 'auto';
        wrapper.style.pageBreakInside = 'auto';

        // Adiciona o título do serviço com a letra sequencial (a, b, c, ...)
        const titulo = document.createElement('div');
        titulo.className = 'proposal-item';
        const letra = String.fromCharCode(97 + index); // "a", "b", "c", etc.
        titulo.textContent = `${letra}. ${project.value}`;
        wrapper.appendChild(titulo);

        // Se o serviço tiver descrição, adiciona o conteúdo formatado
        if (project.dataset.description) {
            const desc = document.createElement('div');
            desc.className = 'proposal-item-description';
            let enhancedDescription = preserveListSymbols(project.dataset.description);

            // Conversão de marcadores especiais em listas
            enhancedDescription = enhancedDescription.replace(/([•✓]) (.*?)(?=<br>|$)/g, '<li>$2<\/li>');
            if (enhancedDescription.includes('<li>')) {
                enhancedDescription = `<ul class="special-markers" style="margin: 0; padding-left: 20px;">${enhancedDescription}<\/ul>`;
            }

            desc.innerHTML = enhancedDescription;
            desc.style.textAlign = 'justify';
            wrapper.appendChild(desc);
        }

        projectsWrapper.appendChild(wrapper);
    });
}


    // Preservar símbolos especiais em listas
    function preserveListSymbols(html) {
        // Preserva marcadores de lista do tipo "•", "✓", etc.
        html = html.replace(/• /g, '<span class="list-marker bullet">• <\/span>');
        html = html.replace(/✓ /g, '<span class="list-marker check">✓ <\/span>');
        
        // Preserva formatação de listas HTML
        html = html.replace(/<ul>/g, '<ul class="preserved-list">');
        html = html.replace(/<ol>/g, '<ol class="preserved-list">');
        
        return html;
    }

    // Editar Objeto
    document.getElementById('edit-object').addEventListener('click', () => {
        const defaultHtml = `
        <ol>
          <li>Fornecimento, instalação e montagem do sistema de pressurização da casa de máquinas de incêndio (CMI)<\/li>
          <li>Fornecimento e instalação do sistema de hidrantes (HID)<\/li>
          <li>Fornecimento e instalação do sistema de sprinklers (SPK)<\/li>
          <li>Fornecimento e instalação do sistema de detecção de alarme de incêndio (SDAI)<\/li>
          <li>Fornecimento e instalação do sistema de alarme de incêndio (SAI)<\/li>
          <li>Fornecimento de extintores de incêndio (EXT)<\/li>
          <li>Fornecimento e instalação da sinalização e orientação de incêndio (SIN)<\/li>
          <li>Fornecimento e fixação de iluminação de emergência (ILU)<\/li>
          <li>Fornecimento e instalação do sistema de proteção de descargas atmosféricas (SPDA)<\/li>
          <li>Manutenção e recarga de extintores de incêndio (MANUT EXT)<\/li>
          <li>Manutenção preventiva de combate a incêndio (MANUT PINC)<\/li>
          <li>Manutenção corretiva de combate a incêndio (MANUT CINC)<\/li>
          <li>Manutenção preventiva e corretiva de combate a incêndio (MANUT P/C INC)<\/li>
          <li>Venda de equipamentos e componentes de prevenção de combate a incêndio (INC)<\/li>
          <li>Elaboração e aprovação do projeto (INC);<\/li>
          <li>Fornecimento de plantas em formato DWG e PDF do projeto de segurança contra incêndio e pânico;<\/li>
          <li>Projeto revisado e assinado por engenheiro credenciado no CBMERJ;<\/li>
          <li>Emissão de Anotação de Responsabilidade Técnica (ART)<\/li>
          <li>Assessoria e consultoria em todas as fases do processo até a emissão do laudo de exigências junto ao CBMERJ;<\/li>
          <li>Emissão de Declaração de Responsável Técnico para procedimento assistido do Certificado de Aprovação (DCA);<\/li>
          <li>Assessoria e consultoria em todas as fases do processo até a emissão do certificado de aprovação junto ao CBMERJ;<\/li>
          <li>NORMAS UTILIZADAS<\/li>
          <ul>
          <li>NBR 13714 Sistemas de Hidrantes e Mangotinhos<\/li>
          <li>NBR 10897 Sistemas de Proteção por Chuveiros Automáticos<\/li>
          <li>NBR 12693 Sistemas de Proteção por Extintores de Incêndio<\/li>
          <li>NBR 13434 Sinalização de Segurança Contra Incêndio e Pânico<\/li>
          <li>NBR 17240 Sistemas de Detecção e Alarme de Incêndio<\/li>
          <li>NBR 10898 Sistemas de Iluminação de Emergência<\/li>
          <li>NBR 5419 Sistema de Proteção de Estruturas Contra Descargas Atmosféricas<\/li>
          <li>NPFA 72 National Fire Alarm and Signaling Code<\/li>
          <\/ul>
        <\/ol>
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
        bootstrap.Modal.getOrCreateInstance(document.getElementById('objectModal')).hide();
    });

    // Editar Observações
    document.getElementById('edit-observations').addEventListener('click', () => {
        const defaultHtml = `
            <ol>
                <li>Escopo elaborado através de arquivos e informações recebidas;</li>
                <li>Os materiais e equipamentos da instalação de incêndio serão de responsabilidade da Contratada ou poderão ser faturados diretamente em nome da Contratante com de acordo prévio;</li>
                <li>Todos os materiais, equipamentos e serviços estarão de acordo com as Normas da ABNT e CBMERJ;</li>
                <li>Será de responsabilidade da Contratante abertura, fechamento de teto, acabamentos e pinturas derivadas das passagens de tubulação e infraestrutura das instalações de incêndio;</li>
                <li>Será de responsabilidade da Contratada a realização de vistoria técnica para elaboração de laudo técnico circunstanciado fotográfico, emitido por profissional legalmente habilitado e qualificado, atestando as condições de operacionalidade e de qualidade técnica de montagem e instalação dos equipamentos e sistemas de segurança contra incêndio e pânico;</li>
                <li>Para as instalações em altura das linhas de hidrantes e SDAI serem inferiores a 5 metros iremos executa-las usando estrutura vertical do tipo andaimes;</li>
                <li>O recolhimento da taxa através do Documento de Arrecadação Emolumentos (DAEM) do Projeto de Segurança contra Incêndio e Pânico será de responsabilidade da Contratante;</li>
                <li>A plotagem (impressão) dos projetos para envio do processo ao CBMERJ, será de responsabilidade da Contratante;</li>
                <li>O Prazo do parecer técnico e aprovação do Laudo de Exigências junto à DGST/CBMERJ é de aproximadamente 90 (noventa) dias a contar da data da entrega do respectivo projeto para análise. Ressaltamos, porém, que este prazo é REGULAMENTAR e depende EXCLUSIVAMENTE do Corpo de Bombeiros, ou seja, não sendo este de responsabilidade da Contratada;</li>
                <li>Não faz parte desta proposta à elaboração de projeto executivo de proteção passiva aos elementos estruturais metálicos, gerador, gás e exaustão mecânica da edificação em questão;</li>
                <li>Será de responsabilidade da Contratante a instalação da fiação elétrica trifásica até a CMI para ligação e adequação das eletrobombas e quadro elétrico;</li>
                <li>Será de responsabilidade da Contratada a elaboração de Laudo CMAR (controle de materiais e acabamentos e revestimentos) incluindo a análise de todos os materiais de acabamento e revestimentos que são utilizados na estrutura do edifício, de acordo com as especificações de fabricação. Pisos; Paredes e divisórias; Tetos e forros; Coberturas. Conforme Instrução Técnica nº 10, determinante para todos os parâmetros e regras que orientam os profissionais no processo de regularização;</li>
                <li>Será de responsabilidade da Contratada a emissão de declaração de responsável técnico, que consiste em documento emitido por profissional legalmente habilitado e qualificado, que atesta o cumprimento das medidas de segurança contra incêndio e pânico;</li>
                <li>Será de responsabilidade da Contratante a elaboração de plano de emergência contra incêndio e pânico, conforme Nota Técnica do CBMERJ, NT 2-10 – Plano de emergência contra incêndio e pânico (PECIP) com emissão de anotação de responsabilidade técnica e pagamento da respectiva guia;</li>
                <li>Faz parte do escopo desta proposta assessoria para obtenção de certificado de aprovação perante respectivamente expedido e aprovado pelo CBMERJ. O Certificado de Aprovação (CA) será emitido pelo CBMERJ que atende a região do imóvel e sua emissão de responsabilidade da Contratada, porém, o mesmo somente será emitido se todas as exigências descritas no LE (laudo de exigências do CBMERJ) forem cumpridas pela Contratante. O Prazo para aprovação do Certificado de Aprovação dependerá do tempo de tramitação do CBMERJ, não sendo este de responsabilidade da Contratada;</li>
                <li>Será de responsabilidade da Contratante a execução em alvenaria da construção da casa de máquina de incêndio e instalação da fiação elétrica trifásica até a CMI para ligação das eletrobombas e quadro elétrico;</li>
                <li>Contratante deverá fornecer local para guarda dos materiais, ferramentas, EPI, uniformes e vestuário pessoal dos funcionários da empresa contratada, bem como disponibilizar sanitários;</li>
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
                <li>Condições de pagamento: 50% sinal + 30 DDL via boleto bancário, após finalização do serviço;</li>
                <li>Condições de pagamento: 45% sinal, 45% na entrega do protocolo do processo e 10% na entrega do Laudo de Exigências (aprovação do projeto);</li>
                <li>Prazo de execução: em até D+XX dias de acordo com o cronograma a ser alinhado (exceto aprovação CBMERJ);</li>
                <li>Prazo de execução: em até 25 dias corridos;</li>
                <li>Prazo de execução e aprovação CBMERJ: em até D+90 dias;</li>
                <li>Obs.: Cobertura de 50% dos extintores;</li>
                <li>Teste em mangueiras realizados in loco, a base de gás;</li>
                <li>Prazo de garantia: serviços (12 meses), materiais e equipamentos (06 meses);</li>
                <li>Prazo de garantia: serviços (12 meses);</li>
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

    // Gerar PDF
    document.getElementById('print-button').addEventListener('click', async () => {
        const proposalNumber = document.getElementById('proposal-number').value;
        const proposalType = document.getElementById('proposal-type').value;
        
        // Mostra o loader no botão
        showButtonLoader();
        
        // Clona o elemento para não afetar o original
        const previewElement = document.getElementById('proposal-preview').cloneNode(true);
        
        // Remove elementos que não devem aparecer no PDF
        previewElement.querySelectorAll('.no-print').forEach(el => el.remove());
        
        // Remove a classe 'hidden' do proposal-content para garantir que apareça no PDF
        const proposalContent = previewElement.querySelector('#proposal-content');
        if (proposalContent) {
            proposalContent.classList.remove('hidden');
        }
        
        const preview = previewElement.innerHTML;

        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    html: preview, 
                    proposalId: proposalNumber,
                    proposalData: {
                        numero: proposalNumber,
                        tipo: proposalType
                    }
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${proposalNumber}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                
                // Esconde o loader após sucesso
                hideButtonLoader();
            } else {
                // Esconde o loader em caso de erro
                hideButtonLoader();
                alert('Erro ao gerar PDF.');
            }
        } catch (error) {
            // Esconde o loader em caso de erro
            hideButtonLoader();
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF.');
        }
    });

    // Função para salvar checkpoint manual
    async function salvarCheckpoint() {
        const propostaId = document.getElementById('proposal-number').value;
        const saveButton = document.getElementById('save-proposal');
        
        if (!propostaId || !propostaId.trim()) {
            alert('⚠️ Número da proposta é obrigatório para salvar.');
            return;
        }

        // Feedback visual no botão
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Salvando...';
        saveButton.disabled = true;
        saveButton.classList.add('btn-secondary');
        saveButton.classList.remove('btn-primary');

        try {
            const proposta = {
                numero: propostaId,
                tipo: document.getElementById('proposal-type').value,
                empresa: document.getElementById('company-selector').value,
                referencia: document.getElementById('proposal-reference').value,
                usuario: document.getElementById('proposal-user').value,
                cliente: document.getElementById('client-select').value,
                contato: document.getElementById('client-contact').value,
                clienteNome: document.getElementById('client-name').value,
                localNome: document.getElementById('location-name').value,
                localEndereco: document.getElementById('location-address').value,
                preambulo: document.getElementById('preambleDescription').value,
                objeto: document.getElementById('objectDescription').value,
                observacoes: document.getElementById('observationsDescription').value,
                esclarecimentos: document.getElementById('clarificationsDescription').value,
                orcamento: document.getElementById('budgetDescription').value,
                servicos: [...document.querySelectorAll('.project-option')].map(cb => ({
                    id: cb.id,
                    checked: cb.checked,
                    descricao: cb.dataset.description || ''
                })),
                ordemServicos: typeof selectedServiceOrder !== "undefined" ? selectedServiceOrder : [],
                dataSalva: new Date().toISOString()
            };

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numero: propostaId, data: proposta })
            });

            if (response.ok) {
                // Feedback de sucesso
                saveButton.textContent = '✅ Salvo!';
                saveButton.classList.add('btn-success');
                saveButton.classList.remove('btn-secondary');
                console.log('💾 Checkpoint salvo:', propostaId);
                
                // Voltar ao estado original após 2 segundos
                setTimeout(() => {
                    saveButton.textContent = originalText;
                    saveButton.classList.add('btn-primary');
                    saveButton.classList.remove('btn-success');
                    saveButton.disabled = false;
                }, 2000);
            } else {
                throw new Error('Erro na resposta do servidor');
            }
        } catch (error) {
            console.error('Erro ao salvar checkpoint:', error);
            
            // Feedback de erro
            saveButton.textContent = '❌ Erro';
            saveButton.classList.add('btn-danger');
            saveButton.classList.remove('btn-secondary');
            
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.classList.add('btn-primary');
                saveButton.classList.remove('btn-danger');
                saveButton.disabled = false;
            }, 2000);
            
            alert('❌ Erro ao salvar a proposta. Tente novamente.');
        }
    }

    // Listener para o botão Salvar Proposta
    document.getElementById('save-proposal').addEventListener('click', salvarCheckpoint);

    // ═══════════════════════════════════════════════════════════════════
    // SISTEMA DE GERENCIAMENTO DE CLIENTES
    // ═══════════════════════════════════════════════════════════════════
    
    let clientsData = [];
    let editingClientId = null;
    
    // Elementos do DOM
    const clientModal = new bootstrap.Modal(document.getElementById('clientModal'));
    const clientForm = document.getElementById('clientForm');
    const clientsList = document.getElementById('clientsList');
    const clientSearch = document.getElementById('clientSearch');
    const clearClientSearch = document.getElementById('clearClientSearch');
    const clientFormBtnText = document.getElementById('clientFormBtnText');
    const cancelClientEdit = document.getElementById('cancelClientEdit');
    const clientSelect = document.getElementById('client-select');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    
    // Função para carregar clientes do banco de dados
    async function loadClients() {
        try {
            const response = await fetch('/api/clients');
            if (response.ok) {
                clientsData = await response.json();
                updateClientSelect();
                renderClientsList();
            } else {
                console.error('Erro ao carregar clientes');
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }
    
    // Função para atualizar o select de clientes na proposta
    function updateClientSelect() {
        const currentValue = clientSelect.value;
        clientSelect.innerHTML = '<option value="">Selecione um cliente...</option>';
        
        clientsData.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.nome;
            clientSelect.appendChild(option);
        });
        
        // Restaura valor selecionado se ainda existir
        if (currentValue && clientsData.find(c => c.id == currentValue)) {
            clientSelect.value = currentValue;
        }
    }
    
    // Função para renderizar lista de clientes no modal
    function renderClientsList(filter = '') {
        const filteredClients = clientsData.filter(client => 
            client.nome.toLowerCase().includes(filter.toLowerCase()) ||
            (client.cnpj && client.cnpj.toLowerCase().includes(filter.toLowerCase()))
        );
        
        if (filteredClients.length === 0) {
            clientsList.innerHTML = '<div class="text-muted text-center py-3">Nenhum cliente encontrado</div>';
            return;
        }
        
        clientsList.innerHTML = filteredClients.map(client => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${client.nome}</h6>
                        ${client.cnpj ? `<small class="text-muted">CNPJ: ${client.cnpj}</small><br>` : ''}
                        ${client.endereco ? `<small class="text-muted">${client.endereco}</small>` : ''}
                    </div>
                    <div class="btn-group-vertical btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm edit-client-btn" data-id="${client.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm delete-client-btn" data-id="${client.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Função para limpar formulário
    function clearClientForm() {
        editingClientId = null;
        document.getElementById('clientEditId').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientCnpj').value = '';
        document.getElementById('clientAddress').value = '';
        clientFormBtnText.textContent = 'Adicionar Cliente';
        cancelClientEdit.style.display = 'none';
    }
    
    // Função para adicionar/editar cliente
    async function saveClient(formData) {
        try {
            const url = editingClientId ? `/api/clients/${editingClientId}` : '/api/clients';
            const method = editingClientId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                await loadClients();
                clearClientForm();
                showAlert(editingClientId ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!', 'success');
            } else {
                const errorMsg = await response.text();
                showAlert(errorMsg, 'danger');
            }
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            showAlert('Erro ao salvar cliente', 'danger');
        }
    }
    
    // Função para excluir cliente
    async function deleteClient(clientId) {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        
        try {
            const response = await fetch(`/api/clients/id/${clientId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadClients();
                showAlert('Cliente excluído com sucesso!', 'success');
            } else {
                const errorMsg = await response.text();
                showAlert(errorMsg, 'danger');
            }
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            showAlert('Erro ao excluir cliente', 'danger');
        }
    }
    
    // Função para mostrar alertas
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const modalBody = document.querySelector('#clientModal .modal-body');
        modalBody.insertBefore(alertDiv, modalBody.firstChild);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Event Listeners
    
    // Submissão do formulário
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('clientName').value.trim(),
            cnpj: document.getElementById('clientCnpj').value.trim(),
            endereco: document.getElementById('clientAddress').value.trim()
        };
        
        if (!formData.nome) {
            showAlert('Nome do cliente é obrigatório', 'danger');
            return;
        }
        
        await saveClient(formData);
    });
    
    // Cancelar edição
    cancelClientEdit.addEventListener('click', clearClientForm);
    
    // Busca de clientes
    clientSearch.addEventListener('input', (e) => {
        renderClientsList(e.target.value);
    });
    
    clearClientSearch.addEventListener('click', () => {
        clientSearch.value = '';
        renderClientsList();
    });
    
    // Delegação de eventos para botões na lista
    clientsList.addEventListener('click', async (e) => {
        const clientId = e.target.closest('button')?.dataset.id;
        if (!clientId) return;
        
        if (e.target.closest('.edit-client-btn')) {
            const client = clientsData.find(c => c.id == clientId);
            if (client) {
                editingClientId = clientId;
                document.getElementById('clientEditId').value = clientId;
                document.getElementById('clientName').value = client.nome;
                document.getElementById('clientCnpj').value = client.cnpj || '';
                document.getElementById('clientAddress').value = client.endereco || '';
                clientFormBtnText.textContent = 'Atualizar Cliente';
                cancelClientEdit.style.display = 'inline-block';
            }
        } else if (e.target.closest('.delete-client-btn')) {
            await deleteClient(clientId);
        }
    });
    
    // Excluir cliente selecionado no select principal
    deleteClientBtn.addEventListener('click', async () => {
        const selectedClientId = clientSelect.value;
        if (!selectedClientId) {
            alert('Selecione um cliente para excluir');
            return;
        }
        
        const client = clientsData.find(c => c.id == selectedClientId);
        if (client && confirm(`Tem certeza que deseja excluir o cliente "${client.nome}"?`)) {
            await deleteClient(selectedClientId);
            clientSelect.value = '';
        }
    });
    
    // Limpar formulário quando modal é aberto
    document.getElementById('clientModal').addEventListener('show.bs.modal', () => {
        clearClientForm();
        loadClients();
    });
    
    // Carregar clientes na inicialização
    loadClients();
    
    // Inicializar cabeçalho com a empresa padrão
    generateHeader('forfire1');

});