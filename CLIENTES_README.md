# Sistema de Gerenciamento de Clientes - FORFIRE

## Funcionalidades Implementadas

✅ **Sistema completo de CRUD para clientes**
- Adicionar novos clientes
- Editar clientes existentes
- Excluir clientes
- Buscar/filtrar clientes

✅ **Interface integrada**
- Modal de gerenciamento acessível pelo botão "ADD" ao lado do select de clientes
- Formulário com campos: Nome (obrigatório), CNPJ e Endereço
- Lista dos clientes cadastrados com opções de editar/excluir
- Campo de busca para filtrar clientes
- Feedback visual com alertas de sucesso/erro

✅ **Banco de dados SQLite**
- Tabela `clients` com campos: id, nome, endereco, cnpj
- Validação de dados no servidor
- Prevenção de nomes duplicados

✅ **API REST completa**
- `GET /api/clients` - Listar todos os clientes
- `POST /api/clients` - Adicionar novo cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/id/:id` - Excluir cliente

✅ **Migração automática**
- Os dados do arquivo Excel foram migrados para o banco de dados
- 61 clientes migrados com sucesso

## Como usar

1. **Acessar o gerenciamento de clientes:**
   - Na seção "DADOS DO CLIENTE", clique no botão "ADD" ao lado do select de clientes
   - Um modal será aberto com todas as funcionalidades

2. **Adicionar novo cliente:**
   - Preencha o nome (obrigatório)
   - Opcionalmente preencha CNPJ e endereço
   - Clique em "Adicionar Cliente"

3. **Editar cliente:**
   - No modal, clique no ícone de editar (lápis) ao lado do cliente desejado
   - Modifique os dados no formulário
   - Clique em "Atualizar Cliente"

4. **Excluir cliente:**
   - **Opção 1:** No modal, clique no ícone de lixeira ao lado do cliente
   - **Opção 2:** Selecione o cliente no select principal e clique no botão da lixeira

5. **Buscar cliente:**
   - Use o campo de busca no modal para filtrar por nome ou CNPJ

## Melhorias implementadas

- **Substituição do Excel:** O sistema não depende mais do arquivo Excel para gerenciar clientes
- **Interface moderna:** Modal responsivo com Bootstrap 5 e ícones FontAwesome
- **Feedback visual:** Alertas de sucesso/erro para todas as operações
- **Validação:** Prevenção de dados inválidos ou duplicados
- **Performance:** Carregamento dinâmico e atualizações em tempo real

## Próximos passos sugeridos

1. **Campos adicionais:** Adicionar campos como telefone, email, pessoa de contato
2. **Importação/Exportação:** Funcionalidade para importar/exportar listas de clientes
3. **Histórico:** Log de alterações nos dados dos clientes
4. **Backup:** Sistema automático de backup da base de clientes

## Tecnologias utilizadas

- **Frontend:** HTML5, CSS3, JavaScript ES6+, Bootstrap 5, FontAwesome
- **Backend:** Node.js, Express.js
- **Banco de dados:** SQLite3
- **Outras:** XLSX para migração do Excel

O sistema está totalmente funcional e pronto para uso em produção!