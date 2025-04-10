<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1>{{ $t('app.title') }}</h1>
          <language-selector />
        </div>
      </div>
    </header>
    <main class="main">
      <div class="container">
        <pokemon-list />
      </div>
    </main>
    <pokemon-modal v-if="modalOpen" />
    <loading-spinner v-if="isLoading" />
  </div>
</template>

<script>
import { onMounted, onUnmounted, computed } from 'vue';
import { useStore, mapGetters } from 'vuex';
import PokemonList from './components/PokemonList/PokemonList.vue';
import PokemonModal from './components/PokemonModal/PokemonModal.vue';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner.vue';
import LanguageSelector from './components/LanguageSelector/LanguageSelector.vue';

export default {
  name: 'App',
  components: {
    PokemonList,
    PokemonModal,
    LoadingSpinner,
    LanguageSelector
  },
  computed: {
    ...mapGetters('pokemon', ['modalOpen', 'isLoading'])
  },
  setup() {
    const store = useStore();
    
    const hasActiveFilters = computed(() => store.getters['pokemon/hasActiveFilters']);
    const hasMorePokemon = computed(() => store.getters['pokemon/hasMorePokemon']);

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottom = document.body.offsetHeight - 100;
      
      if (
        scrollPosition >= bottom && 
        !store.getters['pokemon/isLoading'] && 
        !hasActiveFilters.value &&
        hasMorePokemon.value
      ) {
        store.dispatch('pokemon/fetchPokemonList');
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      
      if (!hasActiveFilters.value) {
        store.dispatch('pokemon/fetchPokemonList');
      }
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {};
  }
};
</script>
