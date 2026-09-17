# SanoAgent - Sistema de Composição Musical Mediada por Inteligência Artificial

## Visão Geral

**SanoAgent** é um sistema educacional inovador que integra musicologia, psicologia positiva e engenharia de software para transformar pensamentos positivos de crianças em composições musicais. O sistema utiliza a API do Gemini para gerar letras em estilos Rock e Tropicália, fundamentado em teorias pedagógicas de Keith Swanwick e John Paynter.

## Características Principais

- **Gerenciamento de Diário**: Registro de pensamentos bons com categorização por humor e tema
- **Composição Musical Automática**: Geração de letras em Rock ou Tropicália via Gemini API
- **Análise de Dados**: Padrões de escrita, jornada emocional e tendências temporais
- **Recomendações Personalizadas**: Sugestões baseadas em análise de comportamento do usuário
- **Portfólio Semestral**: Compilação de todas as composições do período
- **Compartilhamento**: Funcionalidades para compartilhar composições com amigos e professores
- **Relatórios Detalhados**: Análises completas e exportação de dados

## Estrutura do Projeto

### Componentes Google Apps Script (.gs)

**Núcleo do Sistema:**
- `config_properties.gs` - Gestão de variáveis de ambiente e configurações
- `repository_base.gs` - Padrão Repository para operações CRUD
- `initialization_setup.gs` - Inicialização e configuração do sistema

**Serviços Principais:**
- `auth_service.gs` - Autenticação e gestão de usuários
- `diary_service.gs` - Gerenciamento de entradas de diário
- `composition_service.gs` - Orquestração de composições
- `gemini_integration.gs` - Integração com API do Gemini

**Funcionalidades Avançadas:**
- `analytics_recommendations.gs` - Análise de dados e recomendações
- `export_reports.gs` - Exportação e geração de relatórios
- `colab_integration.gs` - Integração com Google Colab
- `cloud_storage_integration.gs` - Gerenciamento de arquivos no Drive
- `notifications_communication.gs` - Sistema de notificações
- `validation_security.gs` - Validação e segurança
- `triggers_automation.gs` - Automação via triggers
- `web_service.gs` - Endpoints da API web
- `api_endpoints.gs` - Endpoints adicionais
- `api_documentation.gs` - Documentação da API
- `constants_config.gs` - Constantes e configurações globais
- `utils_helpers.gs` - Funções utilitárias
- `testing_utilities.gs` - Testes e utilitários de desenvolvimento

### Componentes HTML/CSS/JS

**Páginas Principais:**
- `index.html` - Página inicial e layout base
- `diary.html` - Interface de diário
- `compositions.html` - Galeria de composições
- `analytics.html` - Análise de dados
- `profile.html` - Perfil do usuário
- `admin.html` - Painel de administração
- `help.html` - Central de ajuda
- `portfolio.html` - Portfólio do semestre
- `sharing.html` - Compartilhamento de composições
- `error.html` - Página de erros
- `loading.html` - Página de carregamento
- `components.html` - Componentes reutilizáveis
- `styles.css` - Estilos CSS
- `app.js` - Script principal da aplicação

### Ferramenta Python

- `notebook.py` - Ferramenta de análise e processamento de dados

## Requisitos

### Servidor (Google Apps Script)
- Acesso a Google Workspace
- Chave da API do Gemini
- Permissões para Google Sheets e Google Drive

### Cliente (Frontend)
- Navegador moderno com suporte a ES6+
- JavaScript habilitado

## Integração do painel principal

O fluxo operacional e seus critérios de falha estão em [WORKFLOW_BASICO.md](WORKFLOW_BASICO.md).

O painel usa a fachada autenticada `sanoClientApi(action, token, payload)`. O
token é restaurado do fragmento `#tok=` no primeiro carregamento e validado no
backend; o `userId` utilizado nas leituras e gravações é sempre derivado dessa
sessão. Os fluxos de criar/listar registros do diário e gerar/listar composições
estão disponíveis diretamente no painel. A geração exige consentimento para a
finalidade generativa, retorna um rascunho editável e só persiste a versão que o
aluno aprova explicitamente.

Validação local:

```powershell
npm test
```

### Análise de Dados (Python)
- Python 3.7+
- Bibliotecas padrão (json, csv, datetime, collections)

## Instalação

### 1. Configuração do Google Apps Script

```bash
# Clone ou copie todos os arquivos .gs para seu projeto GAS
# Acesse: https://script.google.com/
```

### 2. Configuração de Propriedades

No Google Apps Script, configure as propriedades do projeto:

```javascript
// Vá para Projeto > Configurações do Projeto > Propriedades do Script
// Adicione as seguintes propriedades:

GEMINI_API_KEY: "sua-chave-aqui"
SPREADSHEETS_ID: "id-da-planilha"
DRIVE_FOLDER_ID: "id-da-pasta"
```

### 3. Inicialização do Sistema

```javascript
// Execute no console do Apps Script:
initializeSanoAgent();
```

### 4. Instalação de Triggers

```javascript
// Execute para instalar triggers automáticos:
installTriggers();
```

## Uso

### Para Usuários (Crianças)

1. **Criar Conta**: Acesse a página de registro
2. **Registrar Pensamento**: Vá para "Diário" e crie uma nova entrada
3. **Gerar Composição**: Selecione a entrada e clique em "Gerar Composição"
4. **Visualizar Resultados**: Veja suas composições em "Composições"
5. **Analisar Progresso**: Acesse "Análise" para ver estatísticas

### Para Professores/Administradores

1. **Acessar Painel**: Vá para "Admin"
2. **Visualizar Relatórios**: Gere relatórios de usuários ou sistema
3. **Gerenciar Usuários**: Crie, edite ou delete contas
4. **Configurar Sistema**: Ajuste triggers e backups

### Para Desenvolvedores (Python)

```bash
# Execute a ferramenta de análise:
python3 notebook.py

# Opções:
# 1. Carregar dados de CSV
# 2. Analisar entradas de diário
# 3. Analisar composições
# 4. Gerar relatório de usuário
# 5. Estatísticas do sistema
```

## API

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

#### Diário
- `POST /api/diary/create` - Criar entrada
- `POST /api/diary/get` - Obter entradas

#### Composições
- `POST /api/composition/generate` - Gerar composição
- `POST /api/composition/get` - Obter composições

#### Análise
- `POST /api/analytics` - Análise de dados
- `POST /api/recommendations` - Recomendações

#### Relatórios
- `POST /api/reports` - Gerar relatório
- `POST /api/export` - Exportar dados

## Arquitetura

### Padrões de Design

- **Repository Pattern**: Abstração de acesso a dados
- **Service Layer**: Lógica de negócios separada
- **Clean Architecture**: Separação de responsabilidades
- **Dependency Injection**: Injeção de dependências

### Fluxo de Dados

```
Usuário (Frontend HTML/JS)
    ↓
Web Service (doPost/doGet)
    ↓
API Endpoints
    ↓
Serviços (Diary, Composition, Auth)
    ↓
Repository (CRUD)
    ↓
Google Sheets (Persistência)
    ↓
Google Drive (Armazenamento)
```

## Segurança

- Autenticação por sessão
- Validação de entrada
- Sanitização de dados
- Auditoria de acesso
- Proteção contra XSS
- Proteção contra SQL Injection

## Conformidade Pedagógica

O sistema segue as teorias de:

- **Keith Swanwick**: Modelo C.L.A.S.P. (Composição, Literatura, Audição, Skills, Performance)
- **John Paynter**: Pedagogia do projeto e experimentação com som
- **Martin Seligman**: Psicologia Positiva e modelo PERMA

## Contribuindo

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Suporte

Para suporte, entre em contato através de:
- Email: support@sanoagent.com
- Página de Ajuda: `/help.html`
- Documentação: `/api_documentation.gs`

## Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Autores

**SanoAgent Team**
- Desenvolvimento: Arquitetura de Software
- Pedagogia: Especialistas em Educação Musical
- Design: Interface Responsiva

## Versão

**v1.0.0** - Lançamento Inicial

## Changelog

### v1.0.0 (2024-01-01)
- Lançamento inicial
- Autenticação de usuários
- Gerenciamento de diário
- Integração com Gemini API
- Geração de composições
- Análise de dados
- Recomendações personalizadas
- Relatórios e exportação

## Roadmap

- [ ] Integração com Spotify
- [ ] Geração de áudio das composições
- [ ] Colaboração em tempo real
- [ ] Aplicativo mobile
- [ ] Suporte a mais idiomas
- [ ] Integração com LMS (Moodle, Google Classroom)

## Agradecimentos

Agradecemos a:
- Google por fornecer as APIs e infraestrutura
- Comunidade de educadores musicais
- Todos os testadores e contribuidores

---

**SanoAgent** - Transformando Pensamentos Positivos em Composições Musicais



---

## Mapeamento de Schema da Planilha (item 6 — pré-requisito para fixtures analíticos)

> **Status do catálogo AI:** vazio — o `SchemaService` expõe apenas abas de infraestrutura baseline. Nenhuma entidade do domínio de composição musical mediada por IA está mapeada.

### Abas declaradas no SchemaService

| Aba (sheetName) | Entidade | Tipo | Colunas |
|---|---|---|---|
| `Usuários` | — (login real) | Autenticação | `Username`, `Password`, `ID`, `Role` |
| `Users` | USERS | Autenticação (baseline) | `ID`, `Name`, `Email`, `Username`, `PasswordHash`, `Role`, `Status`, `LastLoginAt`, `CreatedAt`, `UpdatedAt` |
| `Settings` | SETTINGS | Configuração/Infra | `Key`, `Value`, `Description`, `Scope`, `UpdatedAt`, `UpdatedBy` |
| `Audit_Logs` | AUDIT_LOGS | Infraestrutura | `ID`, `Timestamp`, `Level`, `Action`, `Entity`, `RecordID`, `UserID`, `Message`, `Details`, `CreatedAt` |

> **Nota:** A aba de login usa `Usuários` (com acento) — cuidado com encoding em comparações de nome de aba. As colunas estão na ordem `Username, Password, ID, Role` (diferente do padrão `ID, Username, ...`).

### Entidades pendentes de mapeamento analítico

O schema atual não contém nenhuma entidade do domínio musical-terapêutico. As entidades esperadas do Sano Agent (composição musical, sessões terapêuticas, estados emocionais) não estão declaradas.

| Entidade esperada | Por que ausente | O que precisa ser feito |
|---|---|---|
| Composições / Músicas geradas | Não declarada | Mapear aba real da planilha (letra, melodia, parâmetros de geração) |
| Sessões terapêuticas | Não declarada | Declarar entidade com FK para usuário, estado emocional inicial/final |
| Estados emocionais / Humor | Não declarada | Declarar entidade de avaliação de estado (antes/depois da composição) |
| Parâmetros musicais | Não declarada | Declarar entidade com tonalidade, ritmo, instrumento, estilo |
| Histórico de interações com IA | Não declarada | Declarar entidade de log de prompts/respostas musicais |

> **Ação necessária para o item 6:** Inspecionar a planilha vinculada para identificar as abas do domínio musical. O schema atual é integralmente infraestrutura — nenhum fixture analítico significativo pode ser criado sem antes declarar as entidades de domínio.
