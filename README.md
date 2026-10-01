# Fabrication Planning

Web application for a fabrication planning workflow: engineering releases ISO drawings, each ISO contains spools,
each spool requires materials. The planner generates batches of the spools whose materials are fully in stock;
the rest are marked as pending material.

- **Backend**: Spring Boot REST API, in this folder
- **Frontend**: Angular application, in [`frontend/`](frontend)

Design decisions and business rule interpretations are listed in [ASSUMPTIONS.md](ASSUMPTIONS.md).

## Tech stack

| Part     | Technologies                                                                         |
|----------|--------------------------------------------------------------------------------------|
| Backend  | Java 21, Spring Boot 4.1 (Web MVC, Data JPA, Validation, Security), springdoc-openapi |
| Database | PostgreSQL 16, schema managed by Flyway                                              |
| Frontend | Angular 19, Angular Material, Chart.js (ng2-charts)                                  |
| Tests    | JUnit 5, Mockito, AssertJ, MockMvc                                                   |

## Getting started

### 1. Prerequisites

- JDK 21
- Node.js 18.19+ or 20+ (22 recommended) with npm
- PostgreSQL running on `localhost:5432`

Maven does not need to be installed, the project includes the Maven wrapper (`./mvnw`).

### 2. Create the database

```bash
psql -h localhost -U postgres -c "CREATE DATABASE fabrication"
```

The tables and the sample data are created automatically by Flyway the first time the backend starts.

### 3. Configure the database password

The backend connects as `postgres` / `postgres` by default. If your PostgreSQL password is different, either:

- create `src/main/resources/application-local.properties` (ignored by git) containing
  `spring.datasource.password=your-password`, or
- set the `DB_PASSWORD` (and optionally `DB_USERNAME`) environment variable.

### 4. Start the backend

```bash
./mvnw spring-boot:run
```

The API starts on <http://localhost:8080>.

### 5. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Open <http://localhost:4200> and log in with one of the users below. During development the Angular dev server
forwards every `/api` request to the backend on port 8080 (`frontend/proxy.conf.json`), so both run as one site
in the browser.

## Users and roles

Basic authentication with hardcoded users, configured under `app.security.*` in `application.properties`:

| Username  | Password     | Role    | Can do                         |
|-----------|--------------|---------|--------------------------------|
| `planner` | `planner123` | PLANNER | Everything                     |
| `viewer`  | `viewer123`  | VIEWER  | Read only                      |

The frontend hides the actions a viewer cannot perform; the backend enforces the same rules.

## Frontend screens

| Screen       | What the planner can do                                                                          |
|--------------|--------------------------------------------------------------------------------------------------|
| Dashboard    | Totals for ISOs, spools, available materials, generated batches and pending spools; spool status and lowest stock charts |
| Materials    | Search by code, create, edit, delete, **receive stock** (adds a delivery to the current stock)   |
| ISOs         | Search by ISO number, create, edit, delete; open an ISO to manage its spools                     |
| ISO detail   | Add, rename and delete the ISO's spools                                                          |
| Spools       | Search all spools by spool number and filter by status, e.g. the spools pending material         |
| Spool detail | Add required materials (picked by code), change quantities, see which materials are short       |
| Batches      | **Generate batch** and see the spools batched and every spool left out with the reason; open a batch to see its saved report (spools, materials taken, spools left out), or cancel it |

Every list is paginated and sortable on the server. The layout adapts to phone screens.

## API documentation

Swagger UI: <http://localhost:8080/swagger-ui.html>. Click **Authorize** and log in with one of the users above
to try the endpoints from the browser. The raw OpenAPI document is at `/v3/api-docs`.

## API overview

All endpoints are under `/api/v1/fabrication`. List endpoints are paginated with
`?page=0&size=10&sort=field,asc` (maximum page size 100) and return
`{ content, page, size, totalElements, totalPages }`.

| Method              | Path                                  | Description                                           |
|---------------------|---------------------------------------|-------------------------------------------------------|
| GET                 | `/auth/me`                            | The logged in user and their roles                    |
| GET, POST           | `/materials?search=`                  | List (search by material code), create                |
| GET, PUT, DELETE    | `/materials/{id}`                     | Read, update, delete a material                       |
| POST                | `/materials/{id}/receive`             | Add a delivered quantity to the stock                 |
| GET, POST           | `/isos?search=`                       | List (search by ISO number), create                   |
| GET, PUT, DELETE    | `/isos/{id}`                          | Read, update, delete an ISO                           |
| GET, POST           | `/isos/{isoId}/spools`                | List and create the spools of an ISO                  |
| GET                 | `/spools?search=&status=`             | Search all spools by spool number and/or status       |
| GET, PUT, DELETE    | `/spools/{id}`                        | Read, update, delete a spool                          |
| GET, POST           | `/spools/{spoolId}/materials`         | List and add the materials a spool requires           |
| PUT, DELETE         | `/spools/{spoolId}/materials/{id}`    | Change the required quantity, remove a requirement    |
| POST                | `/batches/generate`                   | Generate a batch, returns batched and pending spools  |
| GET                 | `/batches`, `/batches/{id}`           | List batches, read a batch with its spools            |
| DELETE              | `/batches/{id}`                       | Cancel a batch, its stock is returned                 |
| GET                 | `/dashboard`                          | Totals for the dashboard                              |

Errors are returned as [RFC 9457 problem details](https://www.rfc-editor.org/rfc/rfc9457), for example:

```json
{ "status": 409, "title": "Conflict", "detail": "Material with code 'PIPE-CS-6IN' already exists" }
```

Validation errors (400) also contain an `errors` object with a message per invalid field.

## Database

| Script                                                  | Contents                                      |
|---------------------------------------------------------|-----------------------------------------------|
| `src/main/resources/db/migration/V1__create_tables.sql` | Schema: tables, constraints and indexes       |
| `src/main/resources/db/migration/V2__batch_report.sql`  | Tables for the report saved with each batch   |
| `src/main/resources/db/sample/V1_1__sample_data.sql`    | Demo materials, ISOs, spools and requirements |

Running **Generate batch** on the sample data batches 4 spools and leaves out 5: 3 short of material, 1 whose ISO is under verification and 1 without required materials (the script's header explains why).
To start with an empty database, remove `classpath:db/sample` from `spring.flyway.locations` in `application.properties`.

To reset the database to a fresh state:

```bash
psql -h localhost -U postgres -c "DROP DATABASE fabrication" -c "CREATE DATABASE fabrication"
```

## Tests

### Backend

```bash
./mvnw test
```

- `BatchServiceTest`, `MaterialServiceTest`: unit tests of the business rules with mocked repositories
- `MaterialControllerTest`: web layer test of validation, error responses and role based security
- `CccFsAApplicationTests`: starts the whole application, needs the PostgreSQL database from step 2

### Frontend

```bash
cd frontend
npm run test:ci    # runs once in headless Firefox
npm test           # keeps running and re-tests on every change
```

The tests run in Firefox (`karma-firefox-launcher`, configured in `frontend/karma.conf.js`), which also works with
the snap version of Firefox installed by default on Ubuntu. They cover building the paging query, logging in and
keeping the session, adding credentials to requests, turning backend errors into messages, the paged list loader
(including ignoring outdated responses) and the status badge.

## Production build

```bash
cd frontend
npm run build
```

The static files are written to `frontend/dist/frontend/browser`. They must be served by a web server that also
forwards `/api` to the backend (the same job the dev server proxy does), or from the same origin as the backend.
If the frontend is served from a different origin, add it to `app.cors.allowed-origins` in `application.properties`.

## Project structure

```
├── src/main/java/org/example/ccc_fs_a/    backend, organised by feature
│   ├── material/    materials and stock
│   ├── iso/         ISO drawings
│   ├── spool/       spools and their required materials
│   ├── batch/       batch generation and batches
│   ├── dashboard/   dashboard totals
│   ├── auth/        the logged in user
│   ├── common/      shared API path, pagination response, exceptions and error handler
│   └── config/      security (basic auth, roles, CORS) and OpenAPI configuration
├── src/main/resources/db/                 Flyway schema and sample data scripts
└── frontend/src/app/                      frontend
    ├── core/        authentication, HTTP interceptors, API helpers
    ├── shared/      paged list loader, confirm dialog, status badge
    ├── layout/      menu and top bar shown after login
    └── features/    one folder per screen group: login, dashboard, materials, isos, spools, batches
```

Each backend feature package holds its entity, repository, service, controller and DTOs. Each frontend feature
folder holds its API service, pages and dialogs.
