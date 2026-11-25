# 🌾 Hasad — AI-Powered Crop Yield Prediction

Hasad (حصاد, "harvest") helps farmers in Jordan plan their season. A farmer picks a crop, a target year and a season, and Hasad predicts the **expected production**, **quality** and **price trend**, then explains the result in simple words.

> 🎓 Graduation project — B.Sc. Software Engineering, Applied Science Private University (2026).
> Built by a team of four, led by **Hamza Abuqiyas** (team leader, web application: API + Angular front end).

---

## ✨ Features

- **Accounts** — sign up, log in with JWT, forgot / reset password with an email code
- **Crop prediction** — calls a machine-learning model and saves every result
- **Compare crops** — compare up to 4 crops for the same year and season
- **Charts + "Hasad AI"** — charts for a prediction, a plain-language explanation, and a "ask a question" box
- **Reports** — search, filter by crop, pagination, group by year
- **Dashboard & profile** — farm size, location, crops, prediction history
- **Weather** — current weather and forecast for Amman (Open-Meteo)
- **Admin panel** — users, roles, block / unblock, manage predictions

## 🏗️ Architecture

```
Hasad/
├── backend/    ASP.NET Core Web API (.NET 8) — Clean Architecture
└── frontend/   Angular 21 single-page app
```

**Backend** (`backend/`) — four projects, dependencies point inwards:

```
Hassad.Api ──────────► Hassad.Application ──► Hassad.Domain
     │                        ▲
     └──► Hassad.Infrastructure┘   (implements Application's interfaces)
```

| Project | Responsibility |
|---|---|
| `Hassad.Domain` | Entities (`User`, `Prediction`), enums, business rules |
| `Hassad.Application` | Use cases (auth, profile, predictions, admin, insights, weather), DTOs, `Result` pattern, interfaces |
| `Hassad.Infrastructure` | EF Core + SQL Server, repositories, migrations, BCrypt, JWT, SMTP, HTTP clients (ML model, OpenAI, Open-Meteo) |
| `Hassad.Api` | Thin controllers, global error handling, rate limiting, CORS |

**Frontend** (`frontend/`) — standalone components, organised as `core / features / shared`:

- `core/` — `SessionService`, `AuthService`, **JWT interceptor** (adds the token, handles 401), **guards** (`authGuard`, `adminGuard`, `guestGuard`)
- `features/` — one folder per page (auth, home, dashboard, predictions, reports, profile, weather, support, admin)
- `shared/` — API models and small helpers

The machine-learning model is a separate Python service, called by the API over HTTP (`AiModel:PredictUrl`).

## 🛠️ Tech stack

**Backend:** C#, .NET 8, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT, BCrypt, rate limiting
**Frontend:** Angular 21, TypeScript, RxJS, signals
**Other:** Swagger, Open-Meteo API, OpenAI API, ML model on Render

## 🚀 Run it locally

**Requirements:** .NET 8 SDK, SQL Server (Express is fine), Node.js 20+, Angular CLI.

### 1. Backend
1. Open `backend/HassadClean.sln` in Visual Studio.
2. Right-click **Hassad.Api → Manage User Secrets** and paste `backend/src/Hassad.Api/secrets.template.json`, filled with your own values.
3. Create the database: Package Manager Console (default project `Hassad.Infrastructure`) → `Update-Database`.
4. Run **Hassad.Api** → Swagger at `http://localhost:5046/swagger`.

More details: [`backend/README.md`](backend/README.md).

### 2. Frontend
```bash
cd frontend
npm install
ng serve
```
Open `http://localhost:4200`. The API address is set in `frontend/src/app/core/config/api.config.ts`.

## 🔒 Security notes

- No secrets in the repository — they live in .NET **User Secrets** (see `secrets.template.json`).
- Users can only read and change their **own** data; admin endpoints use an `AdminOnly` policy.
- Rate limits on login, sign-up, password reset and AI calls.
