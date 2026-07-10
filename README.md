# ClientHub - MySQL Backend (Node.js + Express)

## 1) Install
Open terminal in this folder:
- `c:/Users/Parikshit G/OneDrive/Desktop/CRUD/server`

Run:
- `npm install`

## 2) Configure MySQL
- Copy `.env.example` to `.env`
- Update `DB_USER`, `DB_PASSWORD` if needed

## 3) Run
- `npm run dev`

Server: `http://localhost:4000`

## 4) API
- POST `/api/auth/login`
- GET/POST/PUT/DELETE `/api/customers`

Auth is via `Authorization: Bearer <token>`.

