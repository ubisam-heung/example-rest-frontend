# Example REST Frontend

This project is a Vue 3 + Vuetify learning platform frontend. It provides signup/login flows, header navigation, and AI-powered practice/wrong-note flows.

## 1) Tech Stack

- Vue 3
- Vite
- Vuetify 3
- Vue Router
- Pinia
- JavaScript

## 2) Key Features

- Signup/Login pages with error handling
- Header UI reacts to login state
- Route guard for AI practice/wrong-note pages
- Practice: generate 5 questions per category and submit/grade
- Wrong notes: retry incorrect answers, show explanations
- Project info footer

## 3) Run

```sh
npm install
npm run dev
```

Default URL: <http://localhost:5173>

## 4) Configuration

Backend base URL is defined in [src/services/auth.js](src/services/auth.js).

- Default: <http://localhost:8080>

AI question generation depends on the backend Ollama configuration.

## 5) Notes

- Auth APIs are under `/api/auth/*` on the backend.
- Login state is derived from the token stored in `localStorage`.
- Practice APIs are `/api/exam-ai/session`, `/api/exam-ai/grade`, `/api/exam-ai/wrong`.
