<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { authFetch } from '../services/auth'

const API_BASE = 'http://localhost:8080'
const route = useRoute()
const selectedCategory = ref('C')
const loading = ref(false)
const questions = ref([])
const answers = ref({})
const gradeResults = ref({})
const errorMessage = ref('')

const isCodingCategory = computed(() => {
  const value = selectedCategory.value.toLowerCase()
  return value === 'c' || value === 'java' || value === 'python'
})

const answerLabel = computed(() => (isCodingCategory.value ? '출력 결과' : '정답 입력'))

const request = async (url, options) => {
  const response = await authFetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }

  return response.json()
}

const startSession = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await request(`${API_BASE}/api/exam-ai/session`, {
      method: 'POST',
      body: JSON.stringify({ category: selectedCategory.value }),
    })
    questions.value = data.items ?? []
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    if (loading.value) {
      loading.value = false
    }
  }
}

const syncCategoryFromRoute = () => {
  const category = route.query.category
  if (category) {
    selectedCategory.value = category
  }
}

const validateAnswers = () => {
  for (const question of questions.value) {
    const value = answers.value[question.id] ?? ''
    if (!value.trim()) {
      return false
    }
  }
  return true
}

const submitAnswers = async () => {
  errorMessage.value = ''
  if (!validateAnswers()) {
    errorMessage.value = '답을 채워주세요.'
    return
  }

  try {
    const payload = {
      answers: questions.value.map((question) => ({
        id: question.id,
        user_answer: answers.value[question.id],
      })),
    }
    const data = await request(`${API_BASE}/api/exam-ai/grade`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const resultMap = {}
    for (const item of data.items ?? []) {
      resultMap[item.id] = item
    }
    gradeResults.value = resultMap
  } catch (err) {
    errorMessage.value = err.message
  }
}

watch(
  () => route.query.category,
  () => {
    syncCategoryFromRoute()
  },
  { immediate: true }
)
</script>

<template>
  <v-container class="py-10 problem-view">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card class="mb-6" elevation="0" color="#f8f2e6">
          <v-card-text class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4">
            <div>
              <div class="text-h5 font-weight-bold">문제풀기</div>
              <div class="text-body-2 text-medium-emphasis">
                카테고리 {{ selectedCategory }}로 5문제가 생성됩니다.
              </div>
            </div>
            <v-btn color="black" variant="flat" @click="startSession">문제 불러오기</v-btn>
          </v-card-text>
        </v-card>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <div v-if="questions.length === 0" class="text-medium-emphasis">
          문제를 불러온 뒤 풀어주세요.
        </div>

        <v-card v-for="(question, index) in questions" :key="question.id" class="mb-4" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>문제 {{ index + 1 }}</span>
            <v-chip size="small" color="grey" variant="tonal">{{ question.category }}</v-chip>
          </v-card-title>
          <v-card-text>
            <pre class="question-text">{{ question.question_text }}</pre>
            <v-textarea
              v-model="answers[question.id]"
              :label="answerLabel"
              :placeholder="answerLabel === '출력 결과' ? '출력을 입력하세요' : '정답을 입력하세요'"
              variant="outlined"
              rows="2"
            />
            <div v-if="gradeResults[question.id]" class="mt-2">
              <v-chip
                :color="gradeResults[question.id].is_correct ? 'green' : 'red'"
                variant="tonal"
                size="small"
              >
                {{ gradeResults[question.id].is_correct ? '정답' : '오답' }}
              </v-chip>
              <div v-if="!gradeResults[question.id].is_correct" class="text-body-2 mt-2">
                정답: {{ gradeResults[question.id].answer_text }}
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-btn
          color="black"
          variant="flat"
          class="mt-2"
          :disabled="questions.length === 0"
          @click="submitAnswers"
        >
          제출하기
        </v-btn>
      </v-col>
    </v-row>

    <v-overlay
      v-model="loading"
      persistent
      :opacity="0.55"
      color="#111111"
      class="align-center justify-center loading-overlay"
    >
      <div class="loading-card text-center">
        <v-progress-circular indeterminate color="black" size="36" class="mb-4" />
        <div class="text-subtitle-1">
          문제를 로딩중입니다...
        </div>
      </div>
    </v-overlay>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap');

.problem-view {
  color: #1d1d1d;
  font-family: 'Space Grotesk', 'Noto Sans KR', sans-serif;
  background: radial-gradient(circle at 10% 10%, #fbe9d9 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, #e7eefc 0%, transparent 42%),
    linear-gradient(135deg, #fdf8f0 0%, #edf2f7 100%);
  border-radius: 24px;
  padding: 28px;
  position: relative;
  overflow: hidden;
}

.problem-view::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(120deg, rgba(0, 0, 0, 0.04) 0%, transparent 40%);
  pointer-events: none;
}

.problem-view > * {
  position: relative;
  z-index: 1;
}

.question-text {
  background: #f1f1f1;
  padding: 16px;
  border-radius: 10px;
  white-space: pre-wrap;
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-size: 0.95rem;
}

:deep(.loading-overlay) {
  z-index: 3000;
}

.loading-card {
  background: #ffffff;
  color: #111;
  border-radius: 16px;
  padding: 24px 28px;
  min-width: min(360px, 80vw);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}
</style>
