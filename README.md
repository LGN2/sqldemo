# SQL Demo

A small full-stack school management demo built with Spring Boot, Spring Data JPA, MySQL, and a static HTML/CSS/JavaScript frontend.

## Requirements

- Java 21
- Docker Desktop, or a local MySQL 8 installation

## Run the application

1. Start MySQL:

   ```bash
   docker compose up -d
   ```

2. Set the database credentials.

   Windows PowerShell:

   ```powershell
   $env:DB_USERNAME="root"
   $env:DB_PASS="root"
   ```

   macOS/Linux:

   ```bash
   export DB_USERNAME=root
   export DB_PASS=root
   ```

3. Start Spring Boot:

   ```bash
   ./mvnw spring-boot:run
   ```

   On Windows, use `mvnw.cmd spring-boot:run`.

4. Open [http://localhost:8080](http://localhost:8080).

The frontend is served by Spring Boot from `src/main/resources/static`. Port 5500 is only needed when deliberately running the frontend through a separate development server.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/school/add?schoolName=...&location=...` | Create a school |
| GET | `/school/getAll` | List active schools |
| GET | `/school/getById?id=...` | Get an active school |
| PUT | `/school/update?id=...&name=...&location=...` | Update a school |
| DELETE | `/school/deleteById?id=...` | Soft-delete a school |

## Run tests

```bash
./mvnw test
```
