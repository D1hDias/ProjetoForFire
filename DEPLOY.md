# 🚀 Deploy FORFIRE PDF Generator

## Sistema de Deploy Automático

### ✅ Configuração Completa

**Servidor:** vps58911.publiccloud.com.br (191.252.191.10)
**Usuário:** root
**Diretório:** `/root/forfire`
**Banco de Dados:** `/root/forfire/propostas.db` (5.1M)
**Backups:** `/root/forfire_backups/`

### 🔄 Deploy Automático

**Trigger:** Push para branch `main`

**Processo:**
1. GitHub Actions detecta push
2. Conecta via SSH ao VPS
3. Executa `/root/deploy-forfire.sh`
4. **Backup automático do banco** antes de qualquer alteração
5. Atualiza código via `git pull`
6. Instala dependências com `npm install --production`
7. Recarrega aplicação com `pm2 reload`

### 🛡️ Proteção do Banco de Dados

**Garantias:**
- ✅ `.gitignore` bloqueia `*.db` (nunca vai para Git)
- ✅ Backup automático antes de cada deploy
- ✅ Backups nomeados com timestamp
- ✅ Script usa `git reset --hard` (não afeta arquivos ignorados)

**Localização dos Backups:**
```bash
/root/forfire_backups/propostas.db.backup_YYYYMMDD_HHMMSS
```

### 📋 Deploy Manual (Se Necessário)

**Conectar ao VPS:**
```bash
ssh root@vps58911.publiccloud.com.br
```

**Executar deploy:**
```bash
/root/deploy-forfire.sh
```

**Verificar status:**
```bash
pm2 list
pm2 logs forfire-pdf-generator --lines 50
```

**Restaurar backup:**
```bash
# Listar backups disponíveis
ls -lh /root/forfire_backups/

# Restaurar (substitua TIMESTAMP pelo backup desejado)
cp /root/forfire_backups/propostas.db.backup_YYYYMMDD_HHMMSS /root/forfire/propostas.db

# Reiniciar aplicação
pm2 restart forfire-pdf-generator
```

### 🔍 Monitoramento

**GitHub Actions:**
https://github.com/D1hDias/ProjetoForFire/actions

**Logs do Servidor:**
```bash
# Ver logs em tempo real
pm2 logs forfire-pdf-generator

# Ver últimas 100 linhas
pm2 logs forfire-pdf-generator --lines 100

# Ver apenas erros
pm2 logs forfire-pdf-generator --err
```

**Status da aplicação:**
```bash
pm2 list
pm2 describe forfire-pdf-generator
```

### ⚠️ Importante

**NUNCA:**
- ❌ Commitar arquivos `.db` no Git
- ❌ Deletar `/root/forfire_backups/`
- ❌ Fazer `rm -rf` sem verificar o caminho

**SEMPRE:**
- ✅ Verificar GitHub Actions após push
- ✅ Manter backups por pelo menos 30 dias
- ✅ Testar em horário de baixo movimento

### 🔧 Troubleshooting

**Deploy falhou:**
```bash
# Ver logs do deploy
pm2 logs forfire-pdf-generator --err --lines 50

# Verificar status Git
cd /root/forfire
git status
git log -1

# Forçar atualização
git fetch origin main
git reset --hard origin/main
npm install --production
pm2 restart forfire-pdf-generator
```

**Aplicação não inicia:**
```bash
# Ver erro detalhado
pm2 logs forfire-pdf-generator --err

# Reiniciar completamente
pm2 delete forfire-pdf-generator
pm2 start ecosystem.config.js
```

**Banco corrompido:**
```bash
# Restaurar último backup
cd /root/forfire_backups
LAST_BACKUP=$(ls -t propostas.db.backup_* | head -1)
cp $LAST_BACKUP /root/forfire/propostas.db
pm2 restart forfire-pdf-generator
```

### 📊 Comandos Úteis

```bash
# Status completo
pm2 status

# Informações detalhadas
pm2 describe forfire-pdf-generator

# Monitoramento em tempo real
pm2 monit

# Verificar tamanho do banco
ls -lh /root/forfire/propostas.db

# Contar backups
ls /root/forfire_backups/ | wc -l

# Espaço em disco
df -h /root
```

### 🎯 Workflow Recomendado

1. **Desenvolvimento Local:** Fazer alterações no código
2. **Commit & Push:** `git add . && git commit -m "msg" && git push`
3. **GitHub Actions:** Verificar execução em https://github.com/D1hDias/ProjetoForFire/actions
4. **Validação VPS:** SSH no servidor e verificar `pm2 logs`
5. **Teste Funcional:** Acessar aplicação e testar mudanças

### 📞 Contatos de Emergência

**Servidor VPS:** Public Cloud BR
**GitHub:** D1hDias/ProjetoForFire
**Deploy Key:** forfire_deploy (ed25519)
