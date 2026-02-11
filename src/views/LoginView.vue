<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, setToken } from '../services/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

onMounted(() => {
  const message = sessionStorage.getItem('login-message')
  if (message) {
    errorMessage.value = message
    sessionStorage.removeItem('login-message')
  }
})

const submit = async () => {
  errorMessage.value = ''
  loading.value = true
  if (!username.value) {
    errorMessage.value = '아이디를 입력해 주세요.'
    loading.value = false
    return
  }
  if (!password.value) {
    errorMessage.value = '비밀번호를 입력해 주세요.'
    loading.value = false
    return
  }
  try {
    const result = await login({ username: username.value, password: password.value })
    setToken(result.accessToken)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="5">
        <v-card rounded="lg" elevation="4" class="pa-6">
          <v-card-title class="text-h6">로그인</v-card-title>
          <v-card-text>
            <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
              {{ errorMessage }}
            </v-alert>
            <v-text-field v-model="username" label="아이디" variant="outlined" />
            <v-text-field
              v-model="password"
              label="비밀번호"
              variant="outlined"
              type="password"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn :loading="loading" color="primary" variant="flat" @click="submit">
              로그인
            </v-btn>
            <v-spacer />
            <v-btn variant="text" @click="router.push('/register')">회원가입</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
