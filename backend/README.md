# Hassad – Clean Architecture

The Hasad Web API, built with Clean Architecture (refactored from the original single-project graduation version).

```
Hassad.Api ──────────► Hassad.Application ──► Hassad.Domain
     │                        ▲
     └──► Hassad.Infrastructure┘   (implements Application's interfaces)
```

| Project | What lives here | Depends on |
|---|---|---|
| **Hassad.Domain** | `User`, `Prediction`, enums, business rules (profile complete? reset code valid?) | nothing |
| **Hassad.Application** | Use cases (`AuthService`, `ProfileService`, `PredictionService`, `AdminService`, `InsightService`, `WeatherService`), DTOs, `Result`, interfaces (`IUserRepository`, `IEmailSender`, `IAiPredictionClient`...) | Domain |
| **Hassad.Infrastructure** | EF Core `AppDbContext`, repositories, migrations, BCrypt, JWT, SMTP, ML/OpenAI/weather HTTP clients | Application |
| **Hassad.Api** | Thin controllers (same URLs as before), `Program.cs`, error handling, rate limits, CORS | Application + Infrastructure |

Rule of thumb: **arrows point inwards**. The Domain knows nothing about SQL Server or HTTP,
so you can test the rules without a database and change the database without touching the rules.

## First run

1. Open `HassadClean.sln` in Visual Studio.
2. Right-click **Hassad.Api** → **Manage User Secrets** and paste the content of
   `src/Hassad.Api/secrets.template.json`, filled with your real values
   (your SQL Server connection string, a Gmail app password, a long random JWT key...).
3. Set **Hassad.Api** as the startup project and run (profile `http`, port 5046 like before).
4. Swagger opens at `http://localhost:5046/swagger`.

The database is the same one; nothing to migrate. To check that EF sees no difference, run in the
Package Manager Console (default project: Hassad.Infrastructure, startup: Hassad.Api):
`Add-Migration CheckNoChanges` → the migration should be empty, then `Remove-Migration`.

## What changed besides the structure

- Sign-up works again (a stray `;` made it always return 400).
- Users can only read/update their **own** profile and predictions (admins can see all).
- Predictions use the user from the token, not a `UserId` sent by the client.
- `/api/Profile/update` only changes phone, location, farm size and crops.
- Secrets moved out of `appsettings.json` (user-secrets); no default admin password.
- Forgot-password no longer reveals which emails are registered; reset code compared in constant time.
- Rate limits on login / sign-up / reset (10 per minute per IP) and AI calls (20 per minute per user).
- CORS only allows the Angular app (`Cors:AllowedOrigins`).
- Errors are always `{ "message": "..." }`; internal details are logged, not sent to the browser.
- GET endpoints no longer write to the database.
- Email lookups use the unique index (`u.Email == email` instead of `ToLower()`).
- Role and AccountStatus are enums in code (still text in the database).

## Still to do (next steps)

- Unit tests for the services (`Hassad.Application.Tests`) – the interfaces make this easy now.
- Remove plain-text password support (`BCryptPasswordHasher.Verify`) once no old passwords remain.
- Store dates in UTC everywhere (today `JoinDate`/`CreatedAt` use local time like the old data).
- Replace the `TotalPredictions` column with a count query.
