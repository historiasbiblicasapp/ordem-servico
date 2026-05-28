# PLANEJAMENTO — Ponto Digital BM

## Análise da Proposta Ponto Icarus vs. O Que Vamos Construir

---

## 1. VISÃO GERAL

**Seu objetivo:** Criar um sistema SaaS de ponto eletrônico competitivo com a Ponto Icarus, 
para usar na Raitz Galvanização e vender para outras empresas.

**Tecnologia:** React + Vite + TypeScript + shadcn/ui + Supabase (PostgreSQL)
**Nome do projeto:** Ponto Digital BM

---

## 2. COMPARATIVO DE FUNCIONALIDADES

### LEGENDA
| Símbolo | Significado |
|---------|-------------|
| ✅ Faço | Implementação direta, baixa complexidade |
| ⚡ Médio | Possível, exige esforço moderado |
| 🔧 Complexo | Possível, exige bibliotecas externas e mais tempo |
| ❌ Inviável | Não recomendado com a stack atual |

### 2.1 Registro de Ponto

| Funcionalidade | Ponto Icarus | Ponto Digital BM | Complexidade |
|---------------|--------------|------------------|--------------|
| Registro via smartphone (web) | ✅ | ✅ Já temos (PWA) | ⚡ Médio |
| Registro via tablet fixo (Kiosk) | ✅ | ✅ Já temos (KioskPage) | ✅ Faço |
| Registro offline com sincronia | ✅ | ❌ Precisa Service Worker + IndexedDB | 🔧 Complexo |
| Reconhecimento facial biométrico | ✅ (mapeamento 3D) | ❌ Precisa biblioteca JS (face-api.js, Amazon Rekognition) | 🔧 Complexo |
| Geolocalização + geocerca | ✅ | ✅ Já temos GPS | ⚡ Médio |
| PIN/Matrícula (Kiosk) | ✅ | ✅ Já temos | ✅ Faço |
| Anti-duplicidade (mesmo horário) | ✅ | ✅ Já temos | ✅ Faço |
| Hash SHA256 por registro | ✅ (integridade) | ✅ Já temos | ✅ Faço |

### 2.2 Conformidade Legal (Portaria 671/2021)

| Funcionalidade | Complexidade | Status |
|---------------|-------------|--------|
| AFD - Arquivo Fonte de Dados (TXT c/ NSR) | ⚡ Médio | Já implementado |
| AEJ - Arquivo Eletrônico de Jornada (JSON) | ⚡ Médio | Já implementado |
| Espelho de Ponto (PDF para funcionário) | ⚡ Médio | Já implementado |
| Relatório Gerencial (CSV) | ✅ Faço | Já implementado |
| Assinatura eletrônica nos documentos | 🔧 Complexo | Precisa implementar |
| Envio automático de holerites/documentos | 🔧 Complexo | Precisa e-mail automático |

### 2.3 Gestão de Colaboradores

| Funcionalidade | Complexidade | Status |
|---------------|-------------|--------|
| Cadastro completo (CPF, matrícula, cargo, setor) | ✅ Faço | Já implementado |
| Gestão de escalas (5x2, 6x1, 12x36, turno rotativo) | ⚡ Médio | Já implementado |
| Banco de horas (extras, débitos, saldo) | ⚡ Médio | Já implementado |
| Solicitações de ajuste (justificativas) | ⚡ Médio | Já implementado |
| Relatórios gerenciais (25+ tipos) | ⚡ Médio | Temos alguns, expandir |
| Aprovação de ajustes (workflow RH) | ⚡ Médio | Já implementado |

### 2.4 Infraestrutura

| Funcionalidade | Complexidade | Status |
|---------------|-------------|--------|
| Multi-tenant (várias empresas) | ✅ Faço | Já implementado |
| Planos de assinatura (Básico/Profissional/Empresarial/Corporativo) | ✅ Faço | Já implementado |
| Nuvem (Supabase/PostgreSQL) | ✅ Faço | Já configurado |
| Painel Master (super admin) | ✅ Faço | Já implementado |
| Auditoria (log de ações) | ⚡ Médio | Já implementado |

### 2.5 Diferenciais Competitivos

| Funcionalidade | Ponto Icarus | Ponto Digital BM | Prioridade |
|---------------|--------------|------------------|------------|
| Atendimento humanizado | ✅ | ⚡ (depende de você) | Média |
| Zero reclamações Reclame Aqui | ✅ | ⚡ (conquista a longo prazo) | Baixa |
| App Mobile (Flutter) | ❌ (só web) | 🔧 (futuro) | Futuro |
| Offline mode | ✅ | 🔧 (Service Worker) | **Alta** |
| Reconhecimento facial | ✅ | 🔧 (face-api.js ou AWS Rekognition) | **Média** |
| Envio automático de documentos | ✅ | 🔧 (e-mail + assinatura) | Média |

---

## 3. O QUE JÁ ESTÁ PRONTO (do projeto anterior)

### Backend (SQL)
- ✅ Schema completo: empresas (tenants), filiais, funcionários, registros_ponto
- ✅ Escalas (5x2, 6x1, 12x36, turno_rotativo)
- ✅ Banco de horas, ajustes, auditoria
- ✅ RLS (Row Level Security) por tenant
- ✅ Trigger de hash SHA256 por registro
- ✅ View de espelho de ponto
- ✅ JSON inicial com tenant master + empresa exemplo

### Frontend (Web)
- ✅ **KioskPage** — Modo tablet fullscreen com matrícula + PIN
- ✅ **CompanyLogin** — Login com seleção de empresa
- ✅ **EmployeeDashboard** — Bater ponto com GPS, relógio, lista do dia
- ✅ **TimeHistory** — Histórico mensal com navegação
- ✅ **BankHours** — Banco de horas com saldo mensal/detalhe diário
- ✅ **TimeRequests** — Solicitações de ajuste com aprovação
- ✅ **AdminDashboard** — Painel RH com métricas (online/offline/atrasados)
- ✅ **AdminEmployees** — CRUD completo de funcionários
- ✅ **AdminSchedules** — Gestão de escalas/jornadas
- ✅ **AdminReports** — Relatórios AFD, AEJ, Espelho Ponto, CSV
- ✅ **AdminSettings** — Configurações da empresa
- ✅ **MasterDashboard / MasterTenants** — Gestão multi-tenant

---

## 4. ANÁLISE DE VIABILIDADE TÉCNICA

### 4.1 Reconhecimento Facial — 🔧 Complexo, mas viável

**Opções:**

| Opção | Custo | Precisão | Offline? | Complexidade |
|-------|-------|----------|----------|-------------|
| **face-api.js** (navegador) | Grátis | Média (2D) | Sim | Média |
| **Amazon Rekognition** | Pago (US$0.001/imagem) | Alta | Não | Baixa (API pronta) |
| **Azure Face API** | Pago | Alta | Não | Baixa |
| **MediaPipe FaceMesh** | Grátis | Alta (468 pontos) | Sim | Média |
| **Vercel + Rekognition Edge** | Médio | Alta | Sim | Alta |

**Recomendação MVP:** face-api.js (gratuito, roda no navegador, detecta rosto e faz matching).
Custa só processamento do cliente — você não paga por chamada.

### 4.2 Modo Offline — 🔧 Complexo, mas essencial

| Técnica | Descrição | Complexidade |
|---------|-----------|-------------|
| Service Worker + Cache API | Cachear assets (JS/CSS) para app funcionar offline | Baixa |
| IndexedDB (Dexie.js) | Armazenar registros de ponto localmente | Média |
| Background Sync API | Sincronizar automático quando voltar internet | Média |
| PWA + manifest.json | Instalar como app no celular | Baixa |

**Recomendação MVP:** Service Worker para cache + IndexedDB para fila de registros.
Quando voltar internet, sincroniza na ordem. O usuário nunca perde um registro.

### 4.3 App Mobile Nativo — Médio, para versão 2.0

Flutter com Supabase SDK. Reaproveita as regras de negócio.
Pode ser lançado depois que o web estiver consolidado.

### 4.4 Envio Automático de Documentos — Médio

Supabase não tem e-mail embutido. Opções:
- **Resend.com** (grátis 100 e-mails/dia → US$0/mês pra começar)
- **SendGrid** (100 e-mails/dia grátis)
- **AWS SES** (barato, mas mais complexo)
- **Nodemailer + SMTP** (precisa servidor)

**Recomendação MVP:** Resend (SDK JS simples, integração rápida).

---

## 5. PLANO DE AÇÃO — PRIORIZADO

### FASE 1 — MVP Operacional (Semanas 1-2)
**Foco: Funcionalidades obrigatórias para usar na Raitz Galvanização**

| # | Atividade | Status |
|---|-----------|--------|
| 1.1 | ✅ Subir Supabase + rodar migration | 🔄 Precisa anon key |
| 1.2 | ✅ Login multi-tenant funcional | 🔄 Precisa criar usuários |
| 1.3 | ✅ Bater ponto (web + kiosk) | ✅ Pronto |
| 1.4 | ✅ GPS + geolocalização por registro | ✅ Pronto |
| 1.5 | ✅ Cadastro de funcionários (CRUD) | ✅ Pronto |
| 1.6 | ✅ Gestão de escalas | ✅ Pronto |
| 1.7 | ✅ Espelho de ponto + AFD + AEJ | ✅ Pronto |
| 1.8 | ❌ **Modo Offline (PWA)** | ⏳ Pendente |

### FASE 2 — Recursos Competitivos (Semanas 3-4)
**Foco: Diferenciais para vender para outros clientes**

| # | Atividade | Prioridade |
|---|-----------|------------|
| 2.1 | 🔧 Reconhecimento facial (face-api.js) | Alta |
| 2.2 | ⚡ Relatórios gerenciais avançados (25 tipos) | Alta |
| 2.3 | 🔧 Envio de holerites/documentos por e-mail | Média |
| 2.4 | ⚡ Dashboard com gráficos (Recharts) | ✅ Parcial |
| 2.5 | 🔧 Geocerca por filial (restringir GPS a um raio) | Média |

### FASE 3 — Escalabilidade e Vendas (Mês 2)
**Foco: Transformar em SaaS vendável**

| # | Atividade | Prioridade |
|---|-----------|------------|
| 3.1 | 🔧 PWA + Instalação como app no celular | Alta |
| 3.2 | ⚡ Onboarding automático (convite por e-mail) | Média |
| 3.3 | ⚡ Gateway de pagamento (Stripe/Mercado Pago) | Alta |
| 3.4 | ⚡ Landing page + site institucional | Média |
| 3.5 | 🔧 App Flutter (iOS + Android) | Futuro |

### FASE 4 — Enterprise (Mês 3+)

| # | Atividade | Prioridade |
|---|-----------|------------|
| 4.1 | 🔧 Relatório banco de horas oficial (Portaria 671) | Média |
| 4.2 | 🔧 Integração com API de folha de pagamento | Baixa |
| 4.3 | 🔧 Assinatura eletrônica nos documentos (ICP-Brasil) | Baixa |
| 4.4 | 🔧 App Flutter completo com biometria | Futuro |

---

## 6. MODELO DE NEGÓCIO SUGERIDO

Baseado na proposta Ponto Icarus (R$1,50/funcionário/mês):

| Plano | Preço | Funcionários | Recursos |
|-------|-------|--------------|----------|
| **Básico** | R$49/mês | Até 10 | Ponto web + GPS + relatórios básicos |
| **Profissional** | R$99/mês | Até 50 | + Kiosk + reconhecimento facial + AFD/AEJ |
| **Empresarial** | R$199/mês | Até 200 | + Offline + envio documentos + relatórios avançados |
| **Corporativo** | R$399/mês | Ilimitado | + API + suporte prioritário + customizações |

**Preço por funcionário extra (acima do limite):** R$2,00/funcionário/mês
(competitivo com Ponto Icarus que cobra R$1,50, mas aqui o plano já inclui mais recursos)

---

## 7. PERGUNTAS PARA VOCÊ DECIDIR

1. **Reconhecimento facial é obrigatório no MVP?** 
   - Se sim, vou usar face-api.js (gratuito, funciona no navegador)
   - Se não, podemos lançar só com PIN + GPS e adicionar depois

2. **Modo offline é crítico agora?**
   - A Ponto Icarus oferece — seus clientes vão esperar isso
   - Dá para fazer com Service Worker + IndexedDB em ~1 semana

3. **Você quer primeiro usar na Raitz Galvanização ou já pensar em vender?**
   - Se usar internamente: MVP mais rápido (sem facial, sem offline)
   - Se vender: precisa facial + offline + PWA

4. **App Mobile (Flutter) é para agora ou futuro?**
   - Web (PWA) já funciona como app instalável no celular
   - Flutter dá para fazer depois

5. **Precisa de pagamento integrado (Stripe/Mercado Pago)?**
   - Se for vender, sim. Posso integrar com Mercado Pago (mais popular no Brasil)

---

## 8. PRÓXIMO PASSO

Me responda as perguntas da seção 7 e diga se aprova o plano. Aí eu:

1. Limpo/recrio o projeto sem nenhum traço de Lovable
2. Crio um Supabase novo (ou reusamos o existente kmrthcsnjbyufzsphsev)
3. Rodo a migration limpa
4. Subo o frontend com tudo funcionando

Qual é a sua visão?
