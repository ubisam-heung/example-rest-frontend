<script setup lang="js">
import { computed, ref } from 'vue'

const isLoggedIn = ref(false)
const menuItems = computed(() =>
  isLoggedIn.value
    ? [{ title: '로그아웃', value: 'logout', icon: 'mdi-logout' }]
    : [
        { title: '로그인', value: 'login', icon: 'mdi-login' },
        { title: '회원가입', value: 'signup', icon: 'mdi-account-plus' },
      ]
)

const headerMenus = [
  { title: 'C', value: 'c' },
  { title: 'Java', value: 'java' },
  { title: 'Python', value: 'python' },
  { title: 'Theory', value: 'theory' },
]

const headerSubMenus = [
  { title: '문제풀기', value: 'practice', path: '/problem' },
  { title: '오답노트', value: 'review', path: '/check' },
]

const submenuLeft = ref(0)
const activeMenu = ref(null)

const updateSubmenuLeft = (event, menuValue) => {
  const target = event.currentTarget
  if (!target) return

  const rect = target.getBoundingClientRect()
  submenuLeft.value = rect.left + rect.width / 2
  activeMenu.value = menuValue
}

const setActiveMenu = (menuValue) => {
  activeMenu.value = menuValue
}

const goToSubmenu = (path) => {
  window.history.pushState({}, '', path)
}

const handleMenuClick = (value) => {
  if (value === 'logout') isLoggedIn.value = false
}
</script>

<template>
  <v-app>
    <v-app-bar color="white" elevation="1" class="header-bar">
      <v-app-bar-title class="title-stack">
        <div class="text-h6">Rest Project Example</div>
        <div class="text-subtitle-2">조흥재-연구원</div>
      </v-app-bar-title>

      <div class="header-menu">
        <v-menu
          v-for="menu in headerMenus"
          :key="menu.value"
          location="bottom"
          open-on-hover
          :offset="16"
          content-class="header-dropdown"
        >
          <template #activator="{ props }">
            <v-btn
              class="header-menu-btn"
              variant="text"
              v-bind="props"
              :class="{ 'header-menu-btn--active': activeMenu === menu.value }"
              @mouseenter="updateSubmenuLeft($event, menu.value)"
              @focus="updateSubmenuLeft($event, menu.value)"
              @click="setActiveMenu(menu.value)"
            >
              {{ menu.title }}
            </v-btn>
          </template>
          <v-sheet
            class="header-submenu header-submenu--full"
            elevation="0"
            :style="{ backgroundColor: '#2f5cc8', '--submenu-left': submenuLeft + 'px' }"
          >
            <v-list
              class="header-submenu-inner"
              density="compact"
              :style="{ color: '#fff' }"
            >
              <v-btn
                v-for="item in headerSubMenus"
                :key="item.value"
                class="header-submenu-btn"
                variant="text"
                @click="goToSubmenu(item.path)"
              >
                {{ item.title }}
              </v-btn>
            </v-list>
          </v-sheet>
        </v-menu>
      </div>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn class="user-btn" icon="mdi-account-circle" variant="text" v-bind="props" />
        </template>
        <v-list density="compact" min-width="180">
          <v-list-item
            v-for="item in menuItems"
            :key="item.value"
            :title="item.title"
            :prepend-icon="item.icon"
            @click="handleMenuClick(item.value)"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container class="py-10">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card rounded="lg" elevation="6" class="pa-6">
              <v-card-title class="text-h5">Vuetify is ready</v-card-title>
              <v-card-subtitle>UI kit setup for this Vue project</v-card-subtitle>

              <v-card-text>
                Try editing this page and see hot reload in action.
              </v-card-text>

              <v-card-actions>
                <v-btn color="indigo-darken-2" variant="flat">Get Started</v-btn>
                <v-btn variant="text">View API</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped src="./assets/styles/header.css"></style>
