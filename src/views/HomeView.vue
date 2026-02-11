<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { isLoggedIn as getLoggedIn } from '../services/auth'

const isLoggedIn = ref(getLoggedIn())

const syncAuthState = () => {
  isLoggedIn.value = getLoggedIn()
}

onMounted(() => {
  window.addEventListener('auth-changed', syncAuthState)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', syncAuthState)
})
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="4" class="pa-6">
          <v-card-title class="text-h5">
            {{ isLoggedIn ? '로그인에 성공하였습니다.' : '환영합니다' }}
          </v-card-title>
          <v-card-text>
            상단 메뉴에서 문제풀기와 오답노트를 이용해 주세요.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
