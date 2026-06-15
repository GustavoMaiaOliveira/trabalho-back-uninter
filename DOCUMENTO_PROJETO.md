# PROJETO MULTIDISCIPLINAR
## Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS)

---

**Curso:** Análise e Desenvolvimento de Sistemas  
**Disciplina:** Projeto Multidisciplinar  
**Aluno:** Gustavo Maia Oliveira  
**RU:** 4750296  
**Semestre:** 1º/2025  
**Professor:** Prof. Winston Sen Lun Fung, Me.  
**Ênfase:** Back-end  

---

## SUMÁRIO

1. Introdução
2. Análise e Requisitos
   - 2.1 Requisitos Funcionais
   - 2.2 Requisitos Não Funcionais
   - 2.3 Diagrama de Casos de Uso
3. Modelagem e Arquitetura
   - 3.1 Arquitetura Geral
   - 3.2 Diagrama de Classes
   - 3.3 Diagrama Entidade-Relacionamento (DER)
   - 3.4 Endpoints da API
   - 3.5 Tecnologias Utilizadas
4. Implementação (Prototipagem)
   - 4.1 Estrutura do Projeto
   - 4.2 Exemplos de Código
   - 4.3 Repositório
5. Plano de Testes
6. Conclusão
7. Referências

---

## 1. INTRODUÇÃO

A instituição **VidaPlus** administra hospitais, clínicas de bairro, laboratórios e equipes de home care espalhados por múltiplas regiões. A ausência de uma plataforma centralizada impõe desafios críticos: prontuários fragmentados, dificuldade de agendamento, ausência de rastreabilidade e riscos de conformidade com a Lei Geral de Proteção de Dados (LGPD).

O presente projeto propõe o desenvolvimento do **Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS)**, uma aplicação back-end construída como uma **API RESTful** em **Node.js com TypeScript**, utilizando **PostgreSQL** como banco de dados relacional. O sistema centraliza:

- Cadastro e gestão de pacientes e seus históricos clínicos;
- Gestão de profissionais de saúde e suas agendas;
- Agendamento de consultas presenciais e por telemedicina;
- Emissão de prontuários e receitas digitais;
- Administração hospitalar: leitos, internações e altas;
- Segurança e conformidade: controle de acesso por perfil (RBAC), registros de auditoria e proteção de dados sensíveis.

**Usuários principais do sistema:**

| Perfil | Responsabilidades |
|--------|-------------------|
| Administrador | Gestão de cadastros, relatórios, controle de leitos |
| Médico | Consultas, prontuários, prescrições digitais |
| Enfermeiro(a) | Acompanhamento de pacientes, triagem, internações |
| Paciente | Agendamento, visualização de histórico, teleconsulta |
| Técnico | Acesso restrito aos dados pertinentes à função |

A relevância deste sistema se evidencia na criticidade da área de saúde: falhas de segurança ou indisponibilidade podem causar danos irreversíveis a pacientes. Por isso, o projeto adota boas práticas de engenharia de software, incluindo arquitetura em camadas, validação de dados, autenticação segura com JWT e log completo de auditoria.

---

## 2. ANÁLISE E REQUISITOS

### 2.1 Requisitos Funcionais

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF01 | O sistema deve permitir o cadastro de pacientes com dados pessoais, CPF, data de nascimento, tipo sanguíneo e alergias | Alta |
| RF02 | O paciente deve poder visualizar seu histórico clínico completo | Alta |
| RF03 | O paciente deve poder agendar e cancelar consultas presenciais ou por telemedicina | Alta |
| RF04 | O sistema deve gerar link de videochamada para consultas de telemedicina | Média |
| RF05 | O sistema deve enviar notificação de confirmação de agendamento | Média |
| RF06 | O médico deve poder criar e atualizar prontuários dos pacientes | Alta |
| RF07 | O médico deve poder emitir receitas digitais associadas ao prontuário | Alta |
| RF08 | O profissional deve poder gerenciar sua agenda de consultas | Alta |
| RF09 | O sistema deve permitir o controle de status das consultas (agendada, em andamento, concluída, cancelada) | Alta |
| RF10 | O administrador deve poder cadastrar, editar e desativar pacientes e profissionais | Alta |
| RF11 | O administrador deve poder controlar o fluxo de internações e altas nos leitos | Alta |
| RF12 | O sistema deve registrar a ocupação de leitos por unidade hospitalar | Alta |
| RF13 | O administrador deve poder gerar relatórios de atendimentos | Média |
| RF14 | O sistema deve manter registro de auditoria de todas as ações sensíveis | Alta |
| RF15 | O sistema deve suportar controle de acesso por perfil (RBAC) com pelo menos 5 papéis | Alta |
| RF16 | O sistema deve permitir a busca de pacientes por nome ou CPF | Média |
| RF17 | O profissional deve poder visualizar a agenda de consultas por período | Alta |

### 2.2 Requisitos Não Funcionais

| ID | Categoria | Descrição |
|----|-----------|-----------|
| RNF01 | Segurança | Senhas armazenadas com hash bcrypt (fator 12) |
| RNF02 | Segurança | Autenticação via JWT com expiração de 8 horas |
| RNF03 | Segurança | Dados sensíveis (prontuários) protegidos por controle de acesso |
| RNF04 | Segurança | Registro completo de auditoria (quem, quando, o quê, de onde) |
| RNF05 | Conformidade | Conformidade com a LGPD (minimização de dados, anonimização em logs) |
| RNF06 | Desempenho | Respostas da API em menos de 500ms para 95% das requisições sob carga normal |
| RNF07 | Disponibilidade | Disponibilidade mínima de 99,5% com monitoramento de health check |
| RNF08 | Escalabilidade | Arquitetura stateless permitindo escalabilidade horizontal |
| RNF09 | Manutenibilidade | Código TypeScript estritamente tipado, organizado em camadas (controller, service, entity) |
| RNF10 | Portabilidade | Configuração via variáveis de ambiente (.env) para múltiplos ambientes |
| RNF11 | Acessibilidade | API com respostas padronizadas em JSON, compatível com qualquer cliente (web, mobile) |
| RNF12 | Integridade | Uso de UUIDs como chaves primárias, constraints de unicidade em CPF e e-mail |

### 2.3 Diagrama de Casos de Uso

```
                    SISTEMA SGHSS

  ┌─────────────┐     agendar consulta
  │   PACIENTE  │────────────────────────────► [Agendamento]
  └─────────────┘     cancelar consulta              │
         │            ver histórico clínico           │
         │─────────────────────────────────► [Prontuário] ◄──────────────────┐
         │            acessar teleconsulta            │                       │
         └──────────────────────────────────► [Telemedicina]                  │
                                                                               │
  ┌───────────┐       registrar prontuário                                     │
  │  MÉDICO   │────────────────────────────► [Prontuário]                     │
  └───────────┘       emitir receita                                           │
         │────────────────────────────────► [Prescrição]                      │
         │            gerenciar agenda                                         │
         └──────────────────────────────────► [Agendamento]                   │
                                                                               │
  ┌───────────┐       triagem / atualizar prontuário                           │
  │ ENFERMEIRO│────────────────────────────────────────────────────────────────┘
  └───────────┘       controlar leitos
         └──────────────────────────────────► [Leitos]

  ┌──────────────┐    gerenciar cadastros
  │ADMINISTRADOR │────────────────────────► [Usuários/Profissionais/Pacientes]
  └──────────────┘    gerar relatórios
         │───────────────────────────────► [Relatórios]
         │            controlar internações
         └──────────────────────────────────► [Leitos]
```

---

## 3. MODELAGEM E ARQUITETURA

### 3.1 Arquitetura Geral

O sistema adota a **arquitetura em camadas (Layered Architecture)** com os seguintes componentes:

```
┌────────────────────────────────────────────────────┐
│                   CLIENTES                         │
│   (Navegador Web / Aplicativo Mobile / Postman)    │
└─────────────────────┬──────────────────────────────┘
                      │ HTTP/HTTPS (JSON)
                      ▼
┌────────────────────────────────────────────────────┐
│              API LAYER (Express.js)                │
│   Middlewares: Helmet · CORS · Auth (JWT) · Logs   │
│   Routes → Controllers                             │
└─────────────────────┬──────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│             SERVICE / BUSINESS LAYER               │
│   Controllers · Validação (Zod) · AuditService     │
└─────────────────────┬──────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│           DATA ACCESS LAYER (TypeORM)              │
│   Entities · Repositories · QueryBuilder           │
└─────────────────────┬──────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│              PostgreSQL Database                   │
└────────────────────────────────────────────────────┘
```

**Padrões adotados:**
- **MVC adaptado**: separação entre rotas, controllers e entidades;
- **Repository Pattern**: acesso ao banco via TypeORM `getRepository`;
- **RBAC (Role-Based Access Control)**: middleware `authorize()` aplica restrições por perfil;
- **Stateless**: autenticação via JWT sem estado em servidor, permitindo escalabilidade horizontal.

### 3.2 Diagrama de Classes

```
┌────────────────────┐       ┌──────────────────────────┐
│       User         │       │       Patient            │
├────────────────────┤  1:1  ├──────────────────────────┤
│ id: UUID           │◄──────│ id: UUID                 │
│ name: string       │       │ user: User               │
│ email: string      │       │ cpf: string              │
│ password: string   │       │ birthDate: Date          │
│ role: UserRole     │       │ bloodType: string        │
│ active: boolean    │       │ allergies: string        │
│ createdAt: Date    │       │ phone: string            │
└────────────────────┘       │ address: string          │
                             │ healthInsurance: string  │
                             └──────────┬───────────────┘
                                        │ 1:N
           ┌────────────────────────────┘
           ▼
┌────────────────────────┐       ┌────────────────────────────┐
│     Appointment        │       │      MedicalRecord         │
├────────────────────────┤       ├────────────────────────────┤
│ id: UUID               │       │ id: UUID                   │
│ patient: Patient       │       │ patient: Patient           │
│ professional: Prof.    │       │ professional: Professional │
│ scheduledAt: Date      │       │ appointment: Appointment   │
│ type: AppointmentType  │       │ anamnesis: string          │
│ status: ApptStatus     │       │ diagnosis: string          │
│ notes: string          │       │ treatment: string          │
│ videoCallUrl: string   │       │ vitalSigns: JSON           │
│ cancellationReason     │       └──────────┬─────────────────┘
└────────────────────────┘                  │ 1:N
                                            ▼
┌─────────────────────────┐     ┌────────────────────────────┐
│    Professional         │     │       Prescription         │
├─────────────────────────┤     ├────────────────────────────┤
│ id: UUID                │     │ id: UUID                   │
│ user: User              │     │ medicalRecord: MedRecord   │
│ registrationNumber      │     │ professional: Professional │
│ type: ProfType          │     │ medications: JSON[]        │
│ specialty: string       │     │ observations: string       │
│ department: string      │     │ dispensed: boolean         │
│ active: boolean         │     │ validUntil: Date           │
└─────────────────────────┘     └────────────────────────────┘

┌────────────────────────┐     ┌────────────────────────────┐
│         Bed            │     │        AuditLog            │
├────────────────────────┤     ├────────────────────────────┤
│ id: UUID               │     │ id: UUID                   │
│ unit: string           │     │ user: User                 │
│ number: string         │     │ action: string             │
│ floor: string          │     │ entity: string             │
│ ward: string           │     │ entityId: string           │
│ status: BedStatus      │     │ details: JSON              │
│ patient: Patient       │     │ ipAddress: string          │
│ admittedAt: Date       │     │ userAgent: string          │
└────────────────────────┘     └────────────────────────────┘
```

**Enumerações:**

| Enum | Valores |
|------|---------|
| UserRole | admin, patient, doctor, nurse, technician |
| AppointmentType | in_person, telemedicine, exam |
| AppointmentStatus | scheduled, confirmed, in_progress, completed, cancelled |
| BedStatus | available, occupied, maintenance, reserved |
| ProfessionalType | doctor, nurse, technician, physiotherapist |

### 3.3 Diagrama Entidade-Relacionamento (DER)

```
┌──────────┐         ┌────────────────┐         ┌──────────────┐
│  users   │ 1──────1│   patients     │1────────N│ appointments │
│──────────│         │────────────────│          │──────────────│
│ id (PK)  │         │ id (PK)        │          │ id (PK)      │
│ name     │         │ user_id (FK)   │          │ patient_id(FK│
│ email    │         │ cpf (UNIQUE)   │          │ professional_│
│ password │         │ birth_date     │          │   id (FK)    │
│ role     │         │ blood_type     │          │ scheduled_at │
│ active   │         │ allergies      │          │ type         │
└──────────┘         │ phone          │          │ status       │
     │               │ address        │          │ video_url    │
     │1              └────────────────┘          └──────────────┘
     │                       │1                        │
     │                       │N                        │
     │               ┌────────────────┐               │
     │               │ medical_records│◄───────────────┘
     │               │────────────────│         (appointment_id)
     │               │ id (PK)        │
     │               │ patient_id (FK)│────────────────────────┐
     │               │ professional_id│                        │
     │               │ appointment_id │          ┌─────────────┴──┐
     │               │ anamnesis      │ 1───────N│  prescriptions │
     │               │ diagnosis      │          │────────────────│
     │               │ treatment      │          │ id (PK)        │
     │               │ vital_signs    │          │ medical_rec_id │
     │               └────────────────┘          │ professional_id│
     │                                           │ medications    │
     │1                                          │ dispensed      │
     │                                           └────────────────┘
     │
     └──────────────────────────┐
                                │
┌───────────────┐         ┌─────┴──────────┐
│     beds      │         │  professionals │
│───────────────│         │────────────────│
│ id (PK)       │         │ id (PK)        │
│ unit          │         │ user_id (FK)   │
│ number        │         │ reg_number     │
│ floor         │         │ type           │
│ ward          │         │ specialty      │
│ status        │         │ department     │
│ patient_id(FK)│         │ active         │
│ admitted_at   │         └────────────────┘
└───────────────┘
                                            ┌────────────────┐
                                            │  audit_logs    │
                                            │────────────────│
                                            │ id (PK)        │
                                            │ user_id (FK)   │
                                            │ action         │
                                            │ entity         │
                                            │ entity_id      │
                                            │ details (JSON) │
                                            │ ip_address     │
                                            │ created_at     │
                                            └────────────────┘
```

### 3.4 Endpoints da API

**Base URL:** `http://localhost:3000/api/v1`

#### Autenticação

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|------|-------|
| POST | /auth/login | Autenticar usuário | Não | — |
| POST | /auth/register | Criar usuário | Sim | admin |
| GET | /auth/me | Dados do usuário logado | Sim | todos |

**Exemplo — login (requisição):**
```json
POST /api/v1/auth/login
{
  "email": "medico@vidaplus.com.br",
  "password": "Senha@2025"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid-aqui",
    "name": "Dr. João Silva",
    "email": "medico@vidaplus.com.br",
    "role": "doctor"
  }
}
```

#### Pacientes

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | /patients?page=1&limit=20&search= | Listar pacientes | admin, doctor, nurse |
| POST | /patients | Cadastrar paciente | admin |
| GET | /patients/:id | Buscar paciente | admin, doctor, nurse, patient |
| PUT | /patients/:id | Atualizar paciente | admin, nurse |
| DELETE | /patients/:id | Desativar paciente | admin |

**Exemplo — cadastrar paciente:**
```json
POST /api/v1/patients
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "Senha@2025",
  "cpf": "12345678901",
  "birthDate": "1990-05-15",
  "bloodType": "O+",
  "allergies": "Dipirona",
  "phone": "11999990000",
  "address": "Rua das Flores, 100, São Paulo - SP",
  "healthInsurance": "Unimed",
  "healthInsuranceNumber": "00123456"
}
```

#### Profissionais

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | /professionals | Listar profissionais | admin, doctor, nurse |
| POST | /professionals | Cadastrar profissional | admin |
| GET | /professionals/:id | Buscar profissional | todos |
| PUT | /professionals/:id | Atualizar profissional | admin |
| GET | /professionals/:id/schedule?from=&to= | Agenda do profissional | todos |

#### Consultas (Appointments)

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | /appointments | Listar consultas | todos |
| POST | /appointments | Agendar consulta | admin, doctor, nurse, patient |
| GET | /appointments/:id | Detalhar consulta | todos |
| PATCH | /appointments/:id/status | Atualizar status | admin, doctor, nurse |

**Exemplo — agendar consulta:**
```json
POST /api/v1/appointments
{
  "patientId": "uuid-do-paciente",
  "professionalId": "uuid-do-medico",
  "scheduledAt": "2025-07-20T14:00:00Z",
  "type": "telemedicine",
  "notes": "Retorno pós-cirúrgico"
}
```

**Resposta 201:**
```json
{
  "id": "uuid-da-consulta",
  "status": "scheduled",
  "type": "telemedicine",
  "scheduledAt": "2025-07-20T14:00:00.000Z",
  "videoCallUrl": "https://meet.vidaplus.com.br/uuid-da-consulta",
  ...
}
```

#### Prontuários

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | /medical-records/patient/:id | Prontuários do paciente | admin, doctor, nurse |
| GET | /medical-records/:id | Detalhar prontuário | admin, doctor, nurse |
| POST | /medical-records | Criar prontuário | doctor, nurse |
| POST | /medical-records/:id/prescriptions | Emitir receita | doctor |

#### Leitos

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | /beds?status=&unit= | Listar leitos | admin, doctor, nurse |
| POST | /beds | Cadastrar leito | admin |
| POST | /beds/:id/admit | Internar paciente | admin, nurse |
| POST | /beds/:id/discharge | Dar alta ao paciente | admin, nurse |
| PATCH | /beds/:id/status | Alterar status do leito | admin |

### 3.5 Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|------------|--------|--------|
| Node.js | 18+ | Runtime JavaScript no servidor |
| TypeScript | 5.x | Tipagem estática, segurança de código |
| Express.js | 4.18 | Framework HTTP para criação da API REST |
| TypeORM | 0.3.17 | ORM para mapeamento objeto-relacional |
| PostgreSQL | 14+ | Banco de dados relacional principal |
| JWT (jsonwebtoken) | 9.x | Autenticação stateless por tokens |
| bcryptjs | 2.4 | Hashing seguro de senhas |
| Zod | 3.x | Validação de dados de entrada (schemas) |
| Helmet | 7.x | Segurança HTTP (headers de proteção) |
| CORS | 2.8 | Controle de origem cruzada |
| dotenv | 16.x | Gestão de variáveis de ambiente |

**Justificativa das escolhas:**

- **TypeScript**: elimina uma classe inteira de erros em tempo de execução e torna o código autodocumentado, essencial em sistemas críticos de saúde.
- **TypeORM**: permite sincronização automática do schema em desenvolvimento, migrations em produção e query builder seguro contra SQL injection.
- **PostgreSQL**: suporte nativo a JSON/JSONB (para sinais vitais e medicamentos), transações ACID e full-text search. Ideal para dados médicos com alta integridade.
- **JWT**: autenticação stateless viabiliza escalabilidade horizontal sem necessidade de sessão compartilhada.
- **Zod**: validação com inferência de tipos TypeScript integrada, eliminando duplicação entre schema de validação e tipos.

---

## 4. IMPLEMENTAÇÃO (PROTOTIPAGEM)

### 4.1 Estrutura do Projeto

```
sghss-backend/
├── src/
│   ├── entities/           # Entidades TypeORM (mapeiam tabelas do banco)
│   │   ├── User.ts
│   │   ├── Patient.ts
│   │   ├── Professional.ts
│   │   ├── Appointment.ts
│   │   ├── MedicalRecord.ts
│   │   ├── Prescription.ts
│   │   ├── Bed.ts
│   │   └── AuditLog.ts
│   ├── controllers/        # Lógica de cada recurso da API
│   │   ├── auth.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── professional.controller.ts
│   │   ├── appointment.controller.ts
│   │   ├── medicalRecord.controller.ts
│   │   └── bed.controller.ts
│   ├── routes/             # Definição de endpoints e proteções
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── professional.routes.ts
│   │   ├── appointment.routes.ts
│   │   ├── medicalRecord.routes.ts
│   │   └── bed.routes.ts
│   ├── middlewares/        # Auth JWT e tratamento de erros
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── services/           # Serviços transversais
│   │   └── audit.service.ts
│   ├── errors/             # Classe de erro customizado
│   │   └── AppError.ts
│   ├── types/              # Extensão de tipos Express
│   │   └── express.d.ts
│   ├── data-source.ts      # Configuração TypeORM/PostgreSQL
│   ├── app.ts              # Configuração Express
│   └── server.ts           # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### 4.2 Exemplos de Código

#### Middleware de autenticação JWT

```typescript
// src/middlewares/auth.middleware.ts
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// Middleware de autorização por perfil
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acesso negado: permissão insuficiente.' });
      return;
    }
    next();
  };
};
```

#### Serviço de auditoria

```typescript
// src/services/audit.service.ts
export class AuditService {
  static async log(params: {
    userId?: string;
    action: string;   // CREATE | READ | UPDATE | DELETE | LOGIN | ADMIT | DISCHARGE
    entity: string;   // Patient | Appointment | MedicalRecord | Bed | User
    entityId?: string;
    details?: object;
    ipAddress: string;
  }): Promise<void> {
    const repo = AppDataSource.getRepository(AuditLog);
    const entry = repo.create({ ...params, user: params.userId ? { id: params.userId } : undefined });
    await repo.save(entry);
  }
}
```

#### Verificação de conflito de agenda ao agendar

```typescript
// Trecho de appointment.controller.ts
const conflict = await this.repo.findOne({
  where: {
    professional: { id: professionalId },
    scheduledAt: new Date(scheduledAt),
    status: AppointmentStatus.SCHEDULED,
  },
});
if (conflict) throw new AppError('Profissional já possui consulta nesse horário.', 409);
```

#### Proteção de rotas com RBAC

```typescript
// src/routes/medicalRecord.routes.ts
router.post(
  '/:id/prescriptions',
  authenticate,
  authorize(UserRole.DOCTOR),  // Apenas médicos podem prescrever
  ctrl.addPrescription.bind(ctrl)
);
```

### 4.3 Repositório

> **Link do repositório GitHub:**  
> `https://github.com/GustavoMaiaOliveira/trabalho-back-uninter`  
>

**Instruções para executar:**
```bash
git clone https://github.com/GustavoMaiaOliveira/trabalho-back-uninter
cd sghss-backend
npm install
cp .env.example .env
# Editar .env com credenciais do PostgreSQL
createdb sghss
npm run dev
```

---

## 5. PLANO DE TESTES (RESUMO)

Por se tratar de ênfase Back-end, o plano de testes é apresentado em forma de resumo, com os principais casos e estratégias.

### 5.1 Estratégia de Testes

| Tipo | Ferramenta Sugerida | Objetivo |
|------|--------------------|----|
| Testes Unitários | Jest + ts-jest | Validar lógica isolada de controllers e serviços |
| Testes de Integração | Supertest + Jest | Validar endpoints ponta a ponta com banco de dados de teste |
| Testes de Carga | Artillery / k6 | Validar desempenho sob múltiplas requisições simultâneas |
| Testes de Segurança | OWASP ZAP | Detectar vulnerabilidades (injeção, auth bypass, etc.) |

### 5.2 Casos de Teste Principais

| ID | Endpoint | Cenário | Resultado Esperado |
|----|----------|---------|-------------------|
| CT01 | POST /auth/login | Credenciais válidas | 200 + token JWT |
| CT02 | POST /auth/login | Senha incorreta | 401 Unauthorized |
| CT03 | POST /auth/login | Email inexistente | 401 Unauthorized |
| CT04 | POST /patients | CPF já cadastrado | 409 Conflict |
| CT05 | POST /patients | Sem token | 401 Unauthorized |
| CT06 | POST /patients | Token de paciente (sem permissão) | 403 Forbidden |
| CT07 | POST /appointments | Horário já ocupado | 409 Conflict |
| CT08 | POST /appointments | Tipo telemedicina | 201 + videoCallUrl preenchida |
| CT09 | POST /medical-records/:id/prescriptions | Token de nurse | 403 Forbidden |
| CT10 | POST /medical-records/:id/prescriptions | Token de doctor | 201 Created |
| CT11 | POST /beds/:id/admit | Leito já ocupado | 409 Conflict |
| CT12 | GET /medical-records/:id | Log de auditoria gerado | Registro em audit_logs |

### 5.3 Critérios de Aceitação

- Todos os endpoints autenticados retornam **401** sem token;
- Endpoints com restrição de perfil retornam **403** para perfis sem permissão;
- Dados de entrada inválidos retornam **400** com mensagem descritiva;
- Receitas digitais só podem ser criadas por médicos (role: `doctor`);
- Toda leitura de prontuário gera registro em `audit_logs`;
- Senhas nunca são retornadas nas respostas da API (campo com `select: false`).

---

## 6. CONCLUSÃO

O desenvolvimento do SGHSS permitiu aplicar de forma integrada os conceitos de Engenharia de Software estudados ao longo do curso: modelagem de dados relacional, arquitetura em camadas, segurança por controle de acesso baseado em papéis e conformidade com princípios da LGPD.

**Principais lições aprendidas:**

1. **Modelagem cuidadosa previne retrabalho**: a definição clara das entidades e seus relacionamentos antes da implementação evitou mudanças estruturais tardias no banco de dados.

2. **TypeScript eleva a qualidade do código**: o sistema de tipos detectou inconsistências em tempo de desenvolvimento que seriam difíceis de rastrear em JavaScript puro, especialmente em um sistema com muitas entidades inter-relacionadas.

3. **Auditoria desde o início**: implementar o serviço de auditoria como componente transversal desde a primeira versão foi decisivo para garantir rastreabilidade sem acoplamento excessivo nos controllers.

4. **Validação de entrada é crítica**: o uso de Zod para validar e tipar os dados de entrada garantiu que nenhum dado malformado chegue à camada de persistência.

**Desafios encontrados:**

- Gerenciamento correto das relações bidirecionais do TypeORM (eager loading vs lazy loading) exigiu atenção para evitar consultas desnecessárias ao banco;
- Implementação do controle de conflito de agenda requer, em produção, uso de transações com lock pessimista para evitar race conditions.

**Evolução futura do projeto:**

- Implementar notificações em tempo real (WebSocket ou SSE) para confirmação de consultas;
- Adicionar módulo de relatórios gerenciais com exportação em PDF;
- Implementar refresh token para melhorar a experiência do usuário;
- Adicionar testes automatizados com Jest e Supertest;
- Containerizar a aplicação com Docker e Docker Compose;
- Implementar rate limiting para proteção contra ataques de força bruta.

---

## 7. REFERÊNCIAS

FOWLER, Martin. **Patterns of Enterprise Application Architecture**. Addison-Wesley, 2002.

PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de Software: Uma Abordagem Profissional**. 8. ed. Porto Alegre: AMGH, 2016.

SOMMERVILLE, Ian. **Engenharia de Software**. 10. ed. São Paulo: Pearson, 2019.

OWASP FOUNDATION. **OWASP Top Ten**. Disponível em: https://owasp.org/www-project-top-ten/. Acesso em: jun. 2025.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018 — Lei Geral de Proteção de Dados (LGPD)**. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: jun. 2025.

TYPEORM. **TypeORM Documentation**. Disponível em: https://typeorm.io. Acesso em: jun. 2025.

NODE.JS. **Node.js Documentation**. Disponível em: https://nodejs.org/docs. Acesso em: jun. 2025.

TYPESCRIPT. **TypeScript Documentation**. Disponível em: https://www.typescriptlang.org/docs. Acesso em: jun. 2025.

POSTGRESQL. **PostgreSQL 14 Documentation**. Disponível em: https://www.postgresql.org/docs/14/. Acesso em: jun. 2025.

ZOD. **Zod Documentation**. Disponível em: https://zod.dev. Acesso em: jun. 2025.

---

*Documento gerado em junho de 2025.*  
*Aluno: Gustavo Maia Oliveira — RU: 4750296*
