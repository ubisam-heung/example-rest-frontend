# Example REST Frontend

이 프로젝트는 Vue 3 + Vuetify 기반 학습 플랫폼 프론트엔드입니다. 회원가입/로그인과 헤더 메뉴, AI 문제풀이/오답노트 흐름을 제공합니다.

## 1) 기술 스택

- Vue 3
- Vite
- Vuetify 3
- Vue Router
- Pinia
- JavaScript

## 2) 주요 기능

- 회원가입/로그인 화면 및 오류 메시지 처리
- 로그인 상태에 따른 헤더 UI 변경
- AI 문제풀이/오답노트 메뉴 접근 시 로그인 가드
- 문제풀이: 카테고리별 5문제 생성 및 제출/채점
- 오답노트: 오답 재풀이, 해설 보기
- 프로젝트 설명 푸터

## 3) 실행 방법

```sh
npm install
npm run dev
```

기본 접속: <http://localhost:5173>

## 4) 설정

백엔드 주소는 [src/services/auth.js](src/services/auth.js)에서 설정합니다.

- 기본값: <http://localhost:8080>

AI 문제 생성은 백엔드의 Ollama 설정에 의존합니다.

## 5) 참고

- 로그인/회원가입은 백엔드의 `/api/auth/*` API를 사용합니다.
- 새로고침 시 로그인 상태는 `localStorage`에 저장된 토큰으로 판단합니다.
- 문제풀이 API는 `/api/exam-ai/session`, `/api/exam-ai/grade`, `/api/exam-ai/wrong`를 사용합니다.
