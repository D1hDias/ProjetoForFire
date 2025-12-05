const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'propostas.db');
const db = new sqlite3.Database(dbPath);

// Inicializa as tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS proposals (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      numero   TEXT    UNIQUE,
      payload  TEXT,
      created  TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      nome     TEXT UNIQUE,
      endereco TEXT,
      cnpj     TEXT
    )
  `);
});

const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const xlsx = require('xlsx');

const app = express();

// Porta para produção
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para ler clientes do Excel
app.get('/api/clientes-from-excel', (req, res) => {
  try {
    const excelPath = path.join(__dirname, 'public', 'clientes.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converte a planilha para um array de arrays, ignorando cabeçalhos
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Se não houver dados ou apenas o cabeçalho, retorna um array vazio.
    if (data.length <= 1) {
        return res.json([]);
    }

    console.log(`Lendo a primeira coluna do Excel, ignorando a primeira linha (cabeçalho).`);

    // Pula a primeira linha (cabeçalho) com slice(1) e depois mapeia os dados
    const clientes = data.slice(1).map((row, index) => ({
        id: index + 1, 
        nome: row[0] // Pega o valor da primeira coluna (índice 0)
    })).filter(cliente => cliente.nome && String(cliente.nome).trim() !== ''); // Garante que o cliente tem nome

    res.json(clientes);

  } catch (error) {
    console.error('Erro ao ler o arquivo Excel:', error);
    res.status(500).send('Erro ao processar o arquivo de clientes.');
  }
});


// Função para converter imagem para base64
function imageToBase64(imagePath) {
  try {
    const fullPath = path.join(__dirname, 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath);
      const ext = path.extname(imagePath).slice(1);
      const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
      return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error(`Erro ao converter imagem ${imagePath}:`, error);
  }
  return '';
}

// 📄 Rota para gerar o PDF ----------------------------------------------
app.post('/api/generate-pdf', async (req, res) => {
  const { html, filename = 'proposta.pdf', proposalData } = req.body;
  if (!html) return res.status(400).send('HTML content is required');

  let browser;                                  // ← vamos fechar depois
  try {
    browser = await puppeteer.launch({ headless: true,
                                       args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page   = await browser.newPage();

    // Converter imagens para base64 - SEM REORGANIZAR NADA
    let processedHtml = html;
    
    // Substituir ff.png por base64
    const ffPngBase64 = imageToBase64('ff.png');
    if (ffPngBase64) {
      processedHtml = processedHtml.replace(/src="ff\.png"/g, `src="${ffPngBase64}"`);
      processedHtml = processedHtml.replace(/src='ff\.png'/g, `src='${ffPngBase64}'`);
    }
    
    // Substituir logo48.jpg por base64
    const logo48Base64 = imageToBase64('logo48.jpg');
    if (logo48Base64) {
      processedHtml = processedHtml.replace(/src="logo48\.jpg"/g, `src="${logo48Base64}"`);
      processedHtml = processedHtml.replace(/src='logo48\.jpg'/g, `src='${logo48Base64}'`);
    }

    // Substituir sign.jpg por base64
    const signJpgBase64 = imageToBase64('sign.jpg');
    if (signJpgBase64) {
      processedHtml = processedHtml.replace(/src="sign\.jpg"/g, `src="${signJpgBase64}"`);
      processedHtml = processedHtml.replace(/src='sign\.jpg'/g, `src='${signJpgBase64}'`);
    }

    const htmlWithPageBreakStyles = `
    <style>
      @page {
        size: A4;
        margin: 15mm 15mm 25mm 15mm;
      }
      
      html, body {
        font-family: Calibri, Arial;
        background: #fff !important;
        font-size: 12px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        position: relative;
      }
      
      /* Marca d'água fixa em todas as páginas */
      body::before {
        content: '';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        background-image: url('${ffPngBase64}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        opacity: 0.03;
        z-index: 0;
        pointer-events: none;
      }
      
      /* Esconder a imagem ff.png original do conteúdo */
      img[src*="ff.png"],
      img[alt*="Marca d'água"],
      img[alt*="marca d'água"] {
        display: none !important;
      }
      
      /* Layout principal */
      .proposal-body {
        page-break-after: auto;
        border: none !important;
        background: transparent !important;
        padding: 0;
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 100%;
      }
      
      .proposal-content {
        padding: 0;
        margin: 0;
      }
      
      /* Cabeçalho - Layout horizontal otimizado */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ddd;
        page-break-inside: avoid;
        width: 100%;
      }
      
      .header-left {
        display: flex;
        align-items: flex-start;
        flex: 1;
        max-width: 65%;
      }
      
      .header-left img {
        max-height: 65px;
        width: auto;
        margin-right: 15px;
        display: block;
      }
      
      .header-left .text-start {
        flex: 1;
      }
      
      #preview-company-name {
        font-size: 14px;
        color: #333;
        margin-bottom: 2px;
        line-height: 1.1;
      }
      
      #preview-company-address,
      #preview-company-cnpj {
        font-size: 10px;
        color: #666;
        line-height: 1.2;
        margin-bottom: 1px;
      }
      
      .header-right {
        text-align: right;
        font-size: 10px;
        color: #666;
        line-height: 1.4;
        flex-shrink: 0;
        max-width: 35%;
      }
      
      /* Data da proposta */
      .proposal-date {
        text-align: right;
        margin: 15px 0;
        font-size: 11px;
        color: #333;
      }
      
      /* Informações do cliente */
      .client-info {
        margin: 20px 0;
        font-size: 12px;
        line-height: 1.5;
        text-align: left;
      }
      
      .client-info div {
        margin-bottom: 3px;
      }
      
      .client-info div:first-child {
        margin-bottom: 8px;
      }
      
      /* Número da proposta */
      .proposal-number {
        text-align: right;
        margin: 15px 0 25px 0;
        font-size: 12px;
      }
      
      /* Referência */
      .reference {
        margin: 20px 0;
      }
      
      /* Seções do conteúdo */
      .section-title {
        font-weight: bold;
        font-size: 13px;
        margin-top: 25px;
        margin-bottom: 12px;
        color: #333;
        text-transform: uppercase;
        border-bottom: none;
        padding-bottom: 5px;
        page-break-after: avoid;
      }
      
      /* Conteúdo das seções */
      #preview-preamble {
        margin-bottom: 25px;
        text-align: justify;
        line-height: 1.5;
      }
      
      #preview-object,
      #preview-projects-wrapper {
        margin-bottom: 25px;
        text-align: justify;
        line-height: 1.5;
      }
      
      #budget-section {
        margin: 25px 0;
        text-align: center;
        font-size: 14px;
        color: #333;
        page-break-inside: avoid;
      }
      
      #preview-observations,
      #preview-clarifications {
        margin-bottom: 25px;
        text-align: justify;
        line-height: 1.5;
      }
      
      /* Lista de serviços - já definido acima */
      
      .proposal-item {
        margin: 8px 0 5px 20px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .proposal-item-description {
        margin: 5px 0 20px 25px;
        font-size: 12px;
        text-align: justify;
        line-height: 1.4;
      }
      
      .proposal-item-description p {
        margin-bottom: 8px;
      }
      
      .proposal-item-description ul,
      .proposal-item-description ol {
        padding-left: 20px;
        margin: 10px 0;
      }
      
      .proposal-item-description li {
        margin-bottom: 5px;
        text-align: justify;
      }
      
      /* Rodapé */
      .footer {
        margin-top: 30px;
        page-break-inside: avoid;
      }
      
      .footer p {
        margin-bottom: 15px;
        font-size: 12px;
      }
      
      .signature {
        text-align: left;
        margin-top: 20px;
      }
      
      /* Estilos específicos para assinatura */
      img[src*="sign.jpg"],
      img[alt*="Assinatura"],
      img[alt*="assinatura"] {
        max-width: 200px;
        height: auto;
        display: block;
        margin: 10px 0;
      }
      
      /* Alinhamento global */
      .proposal-body p,
      .proposal-body li,
      .proposal-body td,
      .proposal-body th {
        text-align: justify;
      }
      
      /* Controle de quebras de página */
      .header,
      .section-title,
      .proposal-item {
        page-break-inside: avoid;
      }
      
      .proposal-item-description {
        page-break-inside: auto;
        orphans: 2;
        widows: 2;
      }
      
      .no-print {
        display: none !important;
      }
      
      img {
        max-width: 100%;
        height: auto;
        display: block;
        page-break-inside: avoid;
      }
      
      /* Controle específico para imagens de tabelas (geradas do Excel) */
      img[src^="data:image/png"] {
        max-width: 750px !important;
        max-height: 900px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain;
        page-break-before: auto;
        page-break-after: auto;
        page-break-inside: avoid;
      }
    </style>
    ${processedHtml}`;

    await page.setContent(htmlWithPageBreakStyles, { waitUntil: 'networkidle2' });
    
    // Injetar marca d'água via JavaScript como fallback
    await page.evaluate((base64Image) => {
      console.log('🔧 Injetando marca d\'água via JavaScript...');
      
      // Criar elemento de marca d'água
      const watermark = document.createElement('div');
      watermark.id = 'watermark-forfire';
      watermark.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 500px !important;
        height: 500px !important;
        background-image: url('${base64Image}') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        opacity: 0.015 !important;
        z-index: 0 !important;
        pointer-events: none !important;
      `;
      
      // Inserir no início do body
      document.body.insertBefore(watermark, document.body.firstChild);
      
      // Remover imagens ff.png do conteúdo
      const ffImages = document.querySelectorAll('img[src*="ff.png"], img[alt*="Marca"], img[alt*="marca"]');
      console.log(`🗑️ Removendo ${ffImages.length} imagens ff.png do conteúdo`);
      ffImages.forEach(img => img.style.display = 'none');
      
      console.log('✅ Marca d\'água injetada com sucesso!');
      
    }, ffPngBase64);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
  footerTemplate: `
    <div style="width:100%; font-size:9px; 
                display:flex; justify-content:space-between; 
                align-items:center; 
                padding: 0 32px 8px 32px; box-sizing:border-box;">
      <div style="text-align:left;">
        CBMERJ 02-291 / CREA RJ 2013201858 / INMETRO 1720
      </div>
      <div style="text-align:right;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </div>
    </div>
  `,
    margin: { top: '15mm', right: '15mm', bottom: '25mm', left: '15mm' },
});

/* ------------ ENVIO BINÁRIO CORRETO --------------- */
    res.writeHead(200, {
      'Content-Type'        : 'application/pdf',
      'Content-Disposition' : `attachment; filename="${filename}"`,
      'Content-Length'      : pdfBuffer.length
    });
    res.end(pdfBuffer);                        // <- buffer, não string!

  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send(`Error generating PDF: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
});                                           // ← ① fecha generate-pdf aqui

// Listar todos os clientes
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY nome ASC', (err, rows) => {
    if (err) {
      return res.status(500).send('Erro ao buscar clientes');
    }
    res.json(rows);
  });
});

// Adicionar novo cliente
app.post('/api/clients', (req, res) => {
  const { nome, endereco, cnpj } = req.body;
  if (!nome) return res.status(400).send('Nome obrigatório');
  
  db.run('INSERT INTO clients (nome, endereco, cnpj) VALUES (?, ?, ?)', 
    [nome, endereco || '', cnpj || ''], 
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
          return res.status(409).send('Cliente já existe');
        }
        return res.status(500).send('Erro ao adicionar cliente');
      }
      res.status(201).send('Cliente criado');
    }
  );
});

// Atualizar cliente
app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const { nome, endereco, cnpj } = req.body;
  
  if (!nome) return res.status(400).send('Nome obrigatório');
  if (!id || isNaN(id)) return res.status(400).send('ID inválido');
  
  db.run('UPDATE clients SET nome = ?, endereco = ?, cnpj = ? WHERE id = ?', 
    [nome, endereco || '', cnpj || '', Number(id)], 
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
          return res.status(409).send('Cliente com este nome já existe');
        }
        return res.status(500).send('Erro ao atualizar cliente');
      }
      if (this.changes === 0) {
        return res.status(404).send('Cliente não encontrado');
      }
      res.send('Cliente atualizado');
    }
  );
});

// Rota temporária para migrar clientes do Excel para o banco
app.post('/api/migrate-clients', async (req, res) => {
  try {
    // Primeiro, tenta ler clientes do Excel
    const excelPath = path.join(__dirname, 'public', 'clientes.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length <= 1) {
      return res.json({ message: 'Nenhum cliente encontrado no Excel para migrar' });
    }

    let migrated = 0;
    let errors = 0;

    // Pula a primeira linha (cabeçalho) e migra os dados
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && String(row[0]).trim() !== '') {
        const nome = String(row[0]).trim();
        
        // Insere no banco (ignora duplicatas)
        await new Promise((resolve) => {
          db.run('INSERT OR IGNORE INTO clients (nome, endereco, cnpj) VALUES (?, ?, ?)', 
            [nome, '', ''], 
            function(err) {
              if (err) {
                console.error(`Erro ao migrar cliente ${nome}:`, err);
                errors++;
              } else if (this.changes > 0) {
                migrated++;
              }
              resolve();
            }
          );
        });
      }
    }

    res.json({ 
      message: `Migração concluída. ${migrated} clientes migrados, ${errors} erros.` 
    });

  } catch (error) {
    console.error('Erro na migração:', error);
    res.status(500).json({ error: 'Erro ao migrar clientes do Excel' });
  }
});

// Excluir cliente pelo nome
app.delete('/api/clients/id/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).send('ID obrigatório');
  
  db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).send('Erro ao excluir cliente');
    }
    if (this.changes === 0) {
      return res.status(404).send('Cliente não encontrado.');
    }
    res.send('Cliente excluído');
  });
});

// ─── ROTAS DA API ───────────────────────────
// Listar todas
app.get('/api/proposals', (req, res) => {
  db.all('SELECT numero, payload, created FROM proposals ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).send('Erro ao buscar propostas');
    }
    res.json(rows.map(r => ({ ...JSON.parse(r.payload), numero: r.numero, created: r.created })));
  });
});

// Excluir
app.delete('/api/proposals/:numero', (req, res) => {
  db.run('DELETE FROM proposals WHERE numero = ?', [req.params.numero], (err) => {
    if (err) {
      return res.status(500).send('Erro ao excluir proposta');
    }
    res.end();
  });
});

// Obter uma proposta
app.get('/api/proposals/:numero', (req, res) => {
  db.get('SELECT payload FROM proposals WHERE numero = ?', [req.params.numero], (err, row) => {
    if (err) {
      return res.status(500).send('Erro ao buscar proposta');
    }
    if (!row) return res.status(404).end();
    
    const proposta = JSON.parse(row.payload);
    
    // VALIDAÇÃO: Verifica se o cliente ainda existe e se os dados batem
    if (proposta.cliente) {
      db.get('SELECT id, nome FROM clients WHERE id = ?', [proposta.cliente], (clientErr, clienteAtual) => {
        if (!clienteAtual) {
          console.log(`⚠️ Cliente ID ${proposta.cliente} (${proposta.clienteNome}) não existe mais no banco. Limpando dados.`);
          // Limpa referências ao cliente inexistente
          proposta.cliente = '';
          proposta.clienteNome = '';
          proposta.localNome = '';
          proposta.localEndereco = '';
        } else if (proposta.clienteNome && proposta.clienteNome !== clienteAtual.nome) {
          console.log(`⚠️ Cliente ID ${proposta.cliente}: nome salvo "${proposta.clienteNome}" diferente do atual "${clienteAtual.nome}". Atualizando dados.`);
          // Atualiza com dados corretos do banco
          proposta.clienteNome = clienteAtual.nome;
          proposta.localNome = clienteAtual.nome;
        }
        res.json(proposta);
      });
      return; // Sai aqui para aguardar o callback
    }
    
    res.json(proposta);
  });
});


app.get('/api/next-number', (req, res) => {
  const prefix = req.query.prefix || 'FF';          
  const year   = new Date().getFullYear();

  console.log('='.repeat(50));
  console.log('🔥 ROTA /api/next-number CHAMADA!');
  console.log('📊 Parâmetros recebidos:');
  console.log(`   prefix: "${prefix}"`);
  console.log(`   year: ${year}`);
  console.log('='.repeat(50));

  // Busca TODAS as propostas
  db.all('SELECT numero FROM proposals', (err, rows) => {
    if (err) {
      return res.status(500).send('Erro ao buscar propostas');
    }
  
    console.log(`📋 Total de propostas no banco: ${rows.length}`);
    console.log('📝 Lista completa:', rows.map(r => r.numero));

    let last = 0;
    let encontradas = [];
    
    // Filtra por prefixo e ano
    rows.forEach(row => {
      if (row && row.numero) {
        const parts = row.numero.split('-');
        
        // Debug cada proposta
        console.log(`🔍 Analisando: "${row.numero}"`);
        console.log(`   parts: [${parts.join(', ')}]`);
        console.log(`   parts[0] === prefix? ${parts[0]} === ${prefix} → ${parts[0] === prefix}`);
        console.log(`   parts[2] === year? ${parts[2]} === ${year} → ${parts[2] === year.toString()}`);
        
        if (parts.length === 3 && parts[0] === prefix && parts[2] === year.toString()) {
          const num = parseInt(parts[1], 10);
          console.log(`   ✅ MATCH! Número extraído: ${num}`);
          encontradas.push(`${row.numero} → ${num}`);
          
          if (!isNaN(num) && num > last) {
            last = num;
            console.log(`   📈 Novo maior: ${last}`);
          }
        } else {
          console.log(`   ❌ Não match`);
        }
      }
    });

    const next = String(last + 1).padStart(2, '0');
    const numeroCompleto = `${prefix}-${next}-${year}`;
    
    console.log('='.repeat(50));
    console.log('📊 RESULTADO FINAL:');
    console.log(`   Prefixo buscado: "${prefix}"`);
    console.log(`   Propostas encontradas: [${encontradas.join(', ')}]`);
    console.log(`   Maior número: ${last}`);
    console.log(`   Próximo número: "${numeroCompleto}"`);
    console.log('='.repeat(50));

    res.json({ numero: numeroCompleto });
  });
});

// Salvar / atualizar
app.post('/api/proposals', (req, res) => {
  const { numero, data } = req.body;                 // data = objeto da proposta
  if (!numero) return res.status(400).end();

  // Primeiro tenta inserir, se falhar por duplicata, atualiza
  db.run('INSERT INTO proposals (numero, payload, created) VALUES (?, ?, ?)', 
    [numero, JSON.stringify(data), new Date().toISOString()], 
    function(err) {
      if (err && err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
        // Se já existe, atualiza
        db.run('UPDATE proposals SET payload = ? WHERE numero = ?', 
          [JSON.stringify(data), numero], 
          (updateErr) => {
            if (updateErr) {
              return res.status(500).send('Erro ao atualizar proposta');
            }
            res.end();
          }
        );
      } else if (err) {
        return res.status(500).send('Erro ao salvar proposta');
      } else {
        res.end();
      }
    }
  );
});


// 📄 Rota para gerar o PDF com Puppeteer
// app.post('/generate-pdf', async (req, res) => {
//   try {
//     const { html, filename = 'proposta.pdf' } = req.body;
//     if (!html) return res.status(400).send('HTML content is required');

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });

//     const page = await browser.newPage();

//     const htmlWithPageBreakStyles = `
//     <style>
//       @page {
//         size: A4;
//         margin: 8mm 0 10mm 0;
//       }
//       html, body {
//         font-family: Arial, sans-serif;
//         font-size: 11pt;
//         line-height: 1.4;
//         margin: 0;
//         padding: 0;
//       }
//       ul, ol {
//         padding-left: 20px;
//       }
//       .section-title {
//         page-break-after: avoid;
//         font-weight: bold;
//         margin-top: 1em;
//       }
//       .proposal-item {
//         page-break-inside: avoid;
//         break-inside: avoid;
//         orphans: 2;
//         widows: 2;
//       }
//       .proposal-item-description {
//         page-break-inside: auto;
//         break-inside: auto;
//         orphans: 2;
//         widows: 2;
//       }
//       #budget-section {
//         page-break-after: auto !important;
//         break-after: auto !important;
//       }
//       .proposal-body {
//         page-break-after: auto;
//         padding: 20px;       /* usa 20 px (~5 mm) como margem visual    */
//       }
//       .no-print {
//         display: none !important;
//       }
//       img {
//         max-width: 100%;
//         height: auto;
//         display: block;
//       }
//     </style>
//     ${html}`;

//     await page.setContent(htmlWithPageBreakStyles, { waitUntil: 'networkidle0' });
//     await page.emulateMediaType('print');

//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       preferCSSPageSize: true,
    
//       /* ➜ margens: reservamos 25 mm para o rodapé */
//       margin: { top: '0', right: '15mm', bottom: '25mm', left: '15mm' },
    
//       /* ➜ habilita cabeçalho/rodapé HTML */
//       displayHeaderFooter: true,
    
//       /* cabeçalho vazio (ou personalize se quiser) */
//       headerTemplate: '<div></div>',
    
//       /* rodapé com texto legal à esquerda e nº da página à direita */
//       footerTemplate: `
//         <div style="font-size:9px;
//                     width:100%;
//                     padding:0 15mm;
//                     box-sizing:border-box;">
//           <span style="float:left;">CBMERJ&nbsp;02‑291&nbsp;/ CREA&nbsp;RJ&nbsp;2013201858&nbsp;/ INMETRO&nbsp;1720</span>
//           <span style="float:right;">
//             <span class="pageNumber"></span>/<span class="totalPages"></span>
//           </span>
//         </div>`
//     });    

//     await browser.close();

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
//     res.send(pdfBuffer);

//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).send(`Error generating PDF: ${error.message}`);
//   }
// });

// ▶️ Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Externo: http://0.0.0.0:${PORT}`);
  console.log(`📂 Banco: ${dbPath}`);
});
