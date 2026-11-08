# Phonebook – vállalati telefonkönyv

Szakdolgozati projekt: NestJS + PostgreSQL REST API és Vue 3 webes kliens
(hibatűrő keresés, magyar/angol felület, látogató, regisztrált felhasználó és
üzemeltető szerepkör).

- `apps/api` – a NestJS kiszolgáló
- `apps/web-app` – a Vue 3 kliens

## Követelmények

- Docker
- Visual Studio Code a Dev Containers kiegészítővel

## Indítás

1. Töltsd le a tárolót, és nyisd meg VS Code-ban.
2. Másold le a példa környezeti fájlt:

   ```
   cp .devcontainer/.env.example .devcontainer/.env
   ```

3. Töltsd ki a `.devcontainer/.env` fájlt:

   | Változó             | Érték                               |
   | ------------------- | ----------------------------------- |
   | `NODE_ENV`          | `development`                       |
   | `JWT_SECRET`        | tetszőleges hosszú, véletlen szöveg |
   | `POSTGRES_HOST`     | `db`                                |
   | `POSTGRES_PORT`     | `5432`                              |
   | `POSTGRES_USER`     | `phonebook`                         |
   | `POSTGRES_PASSWORD` | tetszőleges jelszó                  |
   | `POSTGRES_DB`       | `phonebook`                         |

4. VS Code-ban: **Dev Containers: Reopen in Container**. A konténer
   létrehozásakor az `npm install` automatikusan lefut, és elindul a
   PostgreSQL adatbázis is.
5. Töltsd fel a kezdeti adatokat (figyelem: törli a meglévő osztályokat és
   felhasználókat):

   ```
   cd apps/api
   npm run build
   node dist/seed.js
   ```

6. Indítsd el a kiszolgálót és a klienst a tároló gyökeréből:

   ```
   npm run dev
   ```

   - kliens: http://localhost:5173
   - API: http://localhost:3000

## Bemutató felhasználók

A seed két példafelhasználót hoz létre. Kitalált, csak a kipróbáláshoz
szolgáló adatok.

| Felhasználónév | Jelszó      | Szerepkör               |
| -------------- | ----------- | ----------------------- |
| `admin`        | `admin1234` | üzemeltető              |
| `testuser`     | `1234`      | regisztrált felhasználó |

Bejelentkezés nélkül a látogatói nézet használható.

## Tesztek

```
npm test -w=api
npm test -w=web-app -- --run
```
