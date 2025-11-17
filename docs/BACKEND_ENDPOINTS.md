# Endpoints consumidos pelo front-end

Lista consolidada de rotas HTTP acessadas pelo projeto `Paginas-em-React`. Todas as URLs relativas usam `import.meta.env.VITE_URL_BACKEND` como base, salvo quando indicado.

## Autenticação e Cadastro
- `POST /usuarios/login`
- `PUT /usuarios/{id}/ultimo-acesso`
- `PATCH /usuarios/{id}/ultimo-acesso`
- `POST /usuarios/fase1`
- `PATCH /usuarios/fase2`
- `PATCH /usuarios/fase2/{id}`
- `GET /usuarios/verificar-cadastro?idUsuario={id}`
- `GET /usuarios/verificar-cadastro?email={email}`
- `POST /usuarios/voluntario/fase1`
- `PATCH /usuarios/voluntario/fase2/{id}`
- `POST /usuarios/voluntario/enviar-credenciais`
- `GET /usuarios/voluntarios`
- `GET /usuarios/{id}`
- `GET /usuarios/nao-classificados`
- `PATCH /usuarios/{id}/classificar/aprovar`
- `PATCH /usuarios/{id}/classificar/rejeitar`
- `POST /assistentes-sociais`
- `GET /login/authorization/google`

## Perfis, Endereços e Fotos
- `GET /perfil/assistente-social?usuarioId={id}`
- `PATCH /perfil/assistente-social/dados-pessoais?usuarioId={id}`
- `PATCH /perfil/assistente-social/dados-profissionais?usuarioId={id}`
- `GET /perfil/assistente-social/endereco?usuarioId={id}`
- `PUT /perfil/assistente-social/endereco?usuarioId={id}`
- `POST /perfil/assistente-social/foto?usuarioId={id}`
- `GET /perfil/voluntario?usuarioId={id}`
- `GET /perfil/voluntario/dados-pessoais?usuarioId={id}`
- `PATCH /perfil/voluntario/dados-pessoais?usuarioId={id}`
- `GET /perfil/voluntario/dados-profissionais?usuarioId={id}`
- `PATCH /perfil/voluntario/dados-profissionais?usuarioId={id}`
- `GET /perfil/voluntario/endereco?usuarioId={id}`
- `PUT /perfil/voluntario/endereco?usuarioId={id}`
- `POST /perfil/voluntario/foto?usuarioId={id}`
- `GET /perfil/usuario/dados-pessoais?usuarioId={id}`
- `POST /perfil/usuario/foto?usuarioId={id}`
- `GET /perfil/assistido/dados-pessoais?usuarioId={id}`
- `GET /perfil/assistido/endereco?usuarioId={id}`
- `PUT /perfil/assistido/endereco?usuarioId={id}`
- `POST /perfil/assistido/foto?usuarioId={id}`
- `GET /perfil/usuario-assistido?usuarioId={id}`
- `GET /perfil/administrador/dados-pessoais?usuarioId={id}`

## Consultas e Agenda
- `GET /consulta/consultas/dia`
- `GET /consulta/consultas/semana`
- `GET /consulta/consultas/mes`
- `GET /consulta/consultas/3-proximas`
- `GET /consulta/consultas/recentes`
- `GET /consulta/consultas/historico`
- `POST /consulta/cancelar/{id}`
- `POST /consulta/consultas/{id}/avaliacao`
- `POST /consulta/consultas/{id}/feedback`
- `GET /consulta/consultas/avaliacoes-feedback`
- `GET /consulta/consultas/{id}/proxima`
- `GET /consulta/horarios-disponiveis?data={YYYY-MM-DD}&idVoluntario={id}`
- `POST /consulta`
- `GET /consulta/consultas/todas`
- `GET /especialidade`

## Pagamentos e Monitoramento
- `POST /pagamentos`
- `GET /health`

## Sincronização de Perfil (dinâmico)
- `GET /perfil/{assistente-social|voluntario|usuario-assistido|usuario|administrador}?usuarioId={id}`

## Integrações Externas e Rotas Internas
- `GET https://viacep.com.br/ws/{CEP}/json/`
- `GET /api/historico/exportar`
- `GET /api/agenda/atualizar`
- Placeholders pendentes: `{BASE_URL}/usuarios`, `{BASE_URL}/formularios/{id}/aprovar`, `{BASE_URL}/formularios/{id}/reprovar`
