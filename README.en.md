# Example REST Frontend

This project is a Vue 3 + Vuetify learning platform frontend. It provides signup/login flows, header navigation, and guarded access to practice/review pages.

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
- Route guard for Practice/Review pages
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

## 5) Notes

- Auth APIs are under `/api/auth/*` on the backend.
- Login state is derived from the token stored in `localStorage`.
