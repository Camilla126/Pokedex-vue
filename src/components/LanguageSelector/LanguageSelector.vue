<template>
  <div class="language-selector">
    <div class="select-wrapper">
      <select v-model="currentLocale" @change="changeLocale" aria-label="Selecionar idioma">
        <option v-for="locale in availableLocales" :key="locale.value" :value="locale.value">
          {{ locale.label }}
        </option>
      </select>
      <div class="flag-indicator" :class="`flag-${currentLocale}`"></div>
      <div class="select-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { availableLocales, setLocale } from '../../i18n/';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const currentLocale = ref(locale.value);

const changeLocale = () => {
  setLocale(currentLocale.value);
};

onMounted(() => {
  currentLocale.value = locale.value;
});
</script>

<style lang="scss" scoped>
@use './styles.modules.scss' as *;
</style>