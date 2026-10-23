# Phonebook

## Environment variables

1. Másold le a `.devcontainer/.env.example` fájlt `.devcontainer/.env` néven.
2. Töltsd ki az értékeket. Ezeket privát csatornán kérd a repó karbantartójától, a gitben nincsenek.
3. A `.devcontainer/.env` fájlt soha ne commitold, a `.gitignore` kizárja.

Szükséges változók:

```
NODE_ENV=

SIS_API_URL=
SIS_API_USER=
SIS_API_PASSWORD=
SIS_API_VID=

JWT_SECRET=

POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=phonebook
POSTGRES_PASSWORD=
POSTGRES_DB=phonebook
```
