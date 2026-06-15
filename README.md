# SGHSS — Sistema de Gestão Hospitalar e de Serviços de Saúde

API Back-end para a instituição VidaPlus.  
**Stack:** Node.js · TypeScript · Express · TypeORM · PostgreSQL

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14

## Instalação e execução

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd sghss-backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 4. Crie o banco de dados no PostgreSQL
createdb sghss

# 5. Execute em modo desenvolvimento (TypeORM sincroniza as tabelas automaticamente)
npm run dev
```

A API estará disponível em `http://localhost:3000`.  
Health check: `GET http://localhost:3000/health`

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/v1/auth/login | Autenticação |
| POST | /api/v1/auth/register | Criar usuário (Admin) |
| GET  | /api/v1/auth/me | Dados do usuário logado |
| GET  | /api/v1/patients | Listar pacientes |
| POST | /api/v1/patients | Cadastrar paciente |
| GET  | /api/v1/patients/:id | Buscar paciente |
| GET  | /api/v1/professionals | Listar profissionais |
| POST | /api/v1/professionals | Cadastrar profissional |
| GET  | /api/v1/professionals/:id/schedule | Agenda do profissional |
| GET  | /api/v1/appointments | Listar consultas |
| POST | /api/v1/appointments | Agendar consulta |
| PATCH| /api/v1/appointments/:id/status | Atualizar status |
| GET  | /api/v1/medical-records/patient/:id | Prontuários do paciente |
| POST | /api/v1/medical-records | Criar prontuário |
| POST | /api/v1/medical-records/:id/prescriptions | Emitir receita |
| GET  | /api/v1/beds | Listar leitos |
| POST | /api/v1/beds/:id/admit | Internar paciente |
| POST | /api/v1/beds/:id/discharge | Dar alta |

## Perfis de acesso (RBAC)

| Role | Permissões |
|------|------------|
| admin | Acesso total |
| doctor | Prontuários, receitas, consultas, leitura de leitos |
| nurse | Consultas, prontuários (leitura/criação), leitos (internar/alta) |
| patient | Ver próprios dados e consultas |
| technician | Leitura de dados relevantes à função |

## Autenticação

Todas as rotas (exceto `/auth/login`) requerem o header:
```
Authorization: Bearer <token>
```
