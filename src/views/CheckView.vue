<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { authFetch } from '../services/auth'

const API_BASE = 'http://localhost:8080'
const route = useRoute()
const selectedCategory = ref('C')
const notes = ref([])
const loading = ref(false)
const errorMessage = ref('')
const answers = ref({})
const gradeResults = ref({})
const showExplanation = ref({})

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

const loadNotes = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const query = selectedCategory.value
      ? `?category=${encodeURIComponent(selectedCategory.value)}`
      : ''
    const data = await request(`${API_BASE}/api/exam-ai/wrong${query}`, { method: 'GET' })
    notes.value = data.items ?? []
    const nextAnswers = {}
    const nextResults = {}
    for (const note of notes.value) {
      nextAnswers[note.id] = answers.value[note.id] ?? ''
      showExplanation.value[note.id] = showExplanation.value[note.id] ?? false
      if (gradeResults.value[note.id]) {
        nextResults[note.id] = gradeResults.value[note.id]
      }
    }
    answers.value = nextAnswers
    gradeResults.value = nextResults
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

const submitAnswer = async (noteId) => {
  errorMessage.value = ''
  const value = answers.value[noteId] ?? ''
  if (!value.trim()) {
    errorMessage.value = '답을 채워주세요.'
    return
  }

  try {
    const payload = { answers: [{ id: noteId, user_answer: value }] }
    const data = await request(`${API_BASE}/api/exam-ai/grade`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (data.items && data.items[0]) {
      gradeResults.value = { ...gradeResults.value, [noteId]: data.items[0] }
    }
    await loadNotes()
  } catch (err) {
    errorMessage.value = err.message
  }
}

const toggleExplanation = (noteId) => {
  showExplanation.value = {
    ...showExplanation.value,
    [noteId]: !showExplanation.value[noteId],
  }
}

const syncCategoryFromRoute = () => {
  const raw = route.query.category
  if (!raw) {
    selectedCategory.value = 'C'
    return
  }
  const value = String(raw)
  if (['C', 'Java', 'Python', 'Theory'].includes(value)) {
    selectedCategory.value = value
  } else {
    selectedCategory.value = 'C'
  }
}

watch(
  () => route.query.category,
  () => {
    syncCategoryFromRoute()
    loadNotes()
  },
  { immediate: true }
)
</script>

<template>
  <v-container class="py-10 wrong-view">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card class="mb-6" elevation="0" color="#eef1ff">
          <v-card-text class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4">
            <div>
              <div class="text-h5 font-weight-bold">오답노트</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ selectedCategory }} 오답만 모아서 확인할 수 있어요.
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-progress-linear v-if="loading" indeterminate color="black" class="mb-4" />

        <div v-if="!loading && notes.length === 0" class="text-medium-emphasis">
          오답노트가 비어 있습니다.
        </div>

        <v-card v-for="note in notes" :key="note.id" class="mb-4" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ note.category }}</span>
          </v-card-title>
          <v-card-text>
            <pre class="question-text">{{ note.question_text }}</pre>
            <div class="text-body-2">이전 답: {{ note.user_answer ?? '-' }}</div>
            <v-textarea
              v-model="answers[note.id]"
              label="다시 풀기"
              placeholder="정답을 입력하세요"
              variant="outlined"
              rows="2"
              class="mt-3"
            />
            <div class="mb-2">
              <v-chip size="small" color="red" variant="tonal">오답</v-chip>
            </div>
            <div class="d-flex flex-wrap align-center ga-3">
              <v-btn color="black" variant="flat" @click="submitAnswer(note.id)">채점하기</v-btn>
              <v-btn color="grey" variant="tonal" @click="toggleExplanation(note.id)">
                {{ showExplanation[note.id] ? '해설닫기' : '해설보기' }}
              </v-btn>
              <v-chip
                v-if="gradeResults[note.id]"
                :color="gradeResults[note.id].is_correct ? 'green' : 'red'"
                variant="tonal"
                size="small"
              >
                {{ gradeResults[note.id].is_correct ? '정답' : '오답' }}
              </v-chip>
            </div>
            <v-alert
              v-if="showExplanation[note.id] && note.explanation"
              type="info"
              variant="tonal"
              class="mt-3"
            >
              {{ note.explanation }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap');

.wrong-view {
  color: #1d1d1d;
  font-family: 'Space Grotesk', 'Noto Sans KR', sans-serif;
  background: radial-gradient(circle at 15% 10%, #e6ecff 0%, transparent 42%),
    radial-gradient(circle at 80% 20%, #f4e6ff 0%, transparent 45%),
    linear-gradient(145deg, #f6f8ff 0%, #fdf5ff 100%);
  border-radius: 24px;
  padding: 28px;
  position: relative;
  overflow: hidden;
}

.wrong-view::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(120deg, rgba(0, 0, 0, 0.04) 0%, transparent 40%);
  pointer-events: none;
}

.wrong-view > * {
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
</style>
