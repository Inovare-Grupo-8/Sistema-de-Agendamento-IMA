# Arquitetura Limpa (Clean Architecture) para Paginas-em-React

Este documento descreve a estrutura proposta de camadas, responsabilidades, convenções e um plano incremental de migração para organizar o projeto de forma mais sustentável.

## Objetivos
- Separar regras de negócio (domínio) de detalhes de implementação (UI, HTTP, libs).
- Facilitar testes, reuso e evolução.
- Reduzir acoplamento entre componentes e serviços.

## Camadas

Da mais estável (centro) para a mais volátil (borda):

1. Dominio (domain)
   - Entidades (models) e tipos puros
   - Casos de uso (usecases) — funções puras/orquestração
   - Portas (ports) — interfaces/contratos para serviços externos

2. Aplicação (application)
   - Serviços que implementam orquestrações de aplicação
   - Adaptadores para casos de uso (facades)
   - Validações, mapeadores e formatadores

3. Infraestrutura (infrastructure)
   - Implementações concretas das portas: HTTP, storage, auth, i18n, etc.
   - Configurações (axios/fetch), mapeamento de endpoints, repositórios

4. Interface (presentation)
   - Componentes React, páginas, rotas, hooks de UI
   - State management de UI (contexts específicos da UI)

As dependências devem apontar sempre do externo para o interno (presentation → application → domain). Infraestrutura pode ser dependida por application através de interfaces (ports), e injetada na composição.

## Nova Estrutura de Pastas

```
src/
  domain/
    entities/            # Tipos e modelos de domínio (ex: Usuario, Consulta, Profissional)
    value-objects/       # Objetos de valor (Cpf, Email, Telefone, Endereco)
    usecases/            # Casos de uso (AgendarConsulta, ListarConsultas, etc.)
    ports/               # Contratos: Repositorios, Gateways, Services
  application/
    services/            # Serviços de aplicação que combinam casos de uso
    mappers/             # DTO <-> Entidade
    validators/          # Regras de validação (Yup/Zod) específicas de aplicação
    facades/             # Facades para a UI
  infrastructure/
    http/                # Clientes HTTP, interceptors, configs
    repositories/        # Implementações das ports com HTTP/Storage
    auth/                # Implementações de autenticação
    i18n/                # Configuração de i18n (carregadores, instância)
    storage/             # LocalStorage/SessionStorage adapters
    config/              # Configs (env, endpoints)
  presentation/
    app/                 # Shell da aplicação (layout, providers, rotas)
    pages/               # Páginas (Next/Vite-Router) mapeadas por rota
    components/          # Componentes de UI puros/reusáveis
    hooks/               # Hooks de UI (useTheme, useToast)
    contexts/            # Contextos de UI (Navigation/UI-state)
    styles/              # CSS/Tailwind específicos da UI
  shared/
    utils/               # Utilitários puros e helpers sem dependência de UI
    types/               # Tipos compartilhados sem semântica de domínio
```

Observações:
- assets públicos continuam em `public/`.
- Testes podem espelhar a estrutura com `__tests__` ou `.test.ts(x)`.
- Evite que `presentation` importe diretamente de `infrastructure`. Use `application` como fronteira.

## Convenções
- Nomes de casos de uso no imperativo: `CreateAppointment`, `GetUserProfile`.
- Ports com sufixo `Port` ou `Repository`: `AppointmentRepository`, `AuthPort`.
- Implementações de infra com sufixo `Http`, `Local`, etc.: `AppointmentHttpRepository`.
- DTOs ficam na camada que conversa com o mundo externo (application/infrastructure).

## Composição e Injeção
Crie um módulo de composição (ex: `src/composition/root.ts`) que instancia os adapters de infra e os injeta nos casos de uso/serviços de aplicação. A UI importa apenas facades/serviços da application.

## Plano de Migração (Incremental)

1) Preparar pastas e contratos
- Criar `domain/ports` com interfaces para usuários, voluntários, consultas.
- Criar `infrastructure/http` com cliente base (axios/fetch) e `repositories` vazios.

2) Mapear entidades
- Mover/duplicar tipos de `src/types` para `src/domain/entities` e ajustar nomes.

3) Extrair casos de uso
- A partir de `services/consultaApi.ts` e `services/voluntarioApi.ts`, criar usecases em `domain/usecases` e serviços em `application/services`.

4) Adaptar UI
- Mover `src/pages`, `src/components`, `src/contexts`, `src/hooks` de UI para `presentation/*`.
- Atualizar imports para passar pela application.

5) Composição
- Adicionar `src/composition` para montar dependências e prover contextos/facades.

6) Remover duplicatas
- Após a migração, apagar os arquivos antigos.

## Risco e Estratégia
- Faça a migração por feature vertical (ex: Consultas): dominio → infra repo → application service → UI.
- Mantenha wrappers de compatibilidade temporários (facades) para evitar quebras.

## Checklist de Features (exemplo)
- [ ] Autenticação
- [ ] Usuários (perfil, completar cadastro)
- [ ] Voluntários
- [ ] Consultas/Agenda
- [ ] Pagamentos

## Exemplo Minimalista (esboço)

Domain/ports:
```ts
export interface AppointmentRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;
  listByUser(userId: string): Promise<Appointment[]>;
}
```

Infrastructure/repository:
```ts
export class AppointmentHttpRepository implements AppointmentRepository {
  constructor(private http: HttpClient) {}
  async create(input: CreateAppointmentInput) { return this.http.post('/appointments', input); }
  async listByUser(userId: string) { return this.http.get(`/users/${userId}/appointments`); }
}
```

Application/service:
```ts
export class AppointmentService {
  constructor(private repo: AppointmentRepository) {}
  create = (input: CreateAppointmentInput) => this.repo.create(input);
  listByUser = (userId: string) => this.repo.listByUser(userId);
}
```

Composição:
```ts
const http = new HttpClient(BASE_URL)
const appointmentRepo = new AppointmentHttpRepository(http)
export const appointmentService = new AppointmentService(appointmentRepo)
```

UI:
```ts
import { appointmentService } from '@/composition/root'
useEffect(() => { appointmentService.listByUser(user.id) }, [user.id])
```

---
Dê preferência a migrar primeiro uma rota de baixo risco (ex: histórico do usuário) e validar a integração ponta-a-ponta. 
