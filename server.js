const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 📄 Rota para gerar o PDF com Puppeteer
app.post('/generate-pdf', async (req, res) => {
  try {
    const { html, filename = 'proposta.pdf' } = req.body;
    if (!html) return res.status(400).send('HTML content is required');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const htmlWithPageBreakStyles = `
    <style>
      @page {
        size: A4;
        margin: 8mm 0 10mm 0;
      }
      html, body {
        font-family: Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.4;
        margin: 0;
        padding: 0;
      }
      ul, ol {
        padding-left: 20px;
      }
      .section-title {
        page-break-after: avoid;
        font-weight: bold;
        margin-top: 1em;
      }
      .proposal-item {
        page-break-inside: avoid;
        break-inside: avoid;
        orphans: 2;
        widows: 2;
      }
      .proposal-item-description {
        page-break-inside: auto;
        break-inside: auto;
        orphans: 2;
        widows: 2;
      }
      #budget-section {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .proposal-body {
        page-break-after: auto;
        padding: 20px;       /* usa 20 px (~5 mm) como margem visual    */
      }
      .no-print {
        display: none !important;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
    </style>
    ${html}`;

    await page.setContent(htmlWithPageBreakStyles, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    
      /* ➜ margens: reservamos 25 mm para o rodapé */
      margin: { top: '0', right: '15mm', bottom: '25mm', left: '15mm' },
    
      /* ➜ habilita cabeçalho/rodapé HTML */
      displayHeaderFooter: true,
    
      /* cabeçalho vazio (ou personalize se quiser) */
      headerTemplate: '<div></div>',
    
      /* rodapé com texto legal à esquerda e nº da página à direita */
      footerTemplate: `
        <div style="font-size:9px;
                    width:100%;
                    padding:0 15mm;
                    box-sizing:border-box;">
          <span style="float:left;">CBMERJ&nbsp;02‑291&nbsp;/ CREA&nbsp;RJ&nbsp;2013201858&nbsp;/ INMETRO&nbsp;1720</span>
          <span style="float:right;">
            <span class="pageNumber"></span>/<span class="totalPages"></span>
          </span>
        </div>`
    });    

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send(`Error generating PDF: ${error.message}`);
  }
});

// ▶️ Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT} e aceitando conexões externas`);
});
