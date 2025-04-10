<template>
  <div class="pokemon-container">
    <pokemon-filter @filter-change="handleFilterChange" />
    <div class="pokemon-list" ref="pokemonList">
      <div class="pokemon-grid">
        <pokemon-card
           v-for="pokemon in filteredPokemon"
           :key="pokemon.id"
           :pokemon="pokemon"
           @click="openPokemonDetails(pokemon)"
        />
      </div>
      <div v-if="filteredPokemon.length === 0 && !isLoading" class="no-results">
        {{ $t('pokemon.list.noResults') }}
      </div>
      <div class="load-more-container" v-if="hasMorePokemon && filteredPokemon.length > 0">
        <button
           @click="loadMorePokemon"
           class="load-more-button"
           :disabled="isLoading"
        >
          {{ isLoading ? $t('pokemon.list.loading') : $t('pokemon.list.loadMore') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import PokemonCard from '../PokemonCard/PokemonCard.vue';
import PokemonFilter from '../PokemonFilter/PokemonFilter.vue';

const store = useStore();
const { t } = useI18n();
const pokemonList = ref(null);
const filteredPokemon = computed(() => store.getters['pokemon/filteredPokemon']);
const isLoading = computed(() => store.getters['pokemon/isLoading']);
const hasMorePokemon = computed(() => store.getters['pokemon/hasMorePokemon']);

const openPokemonDetails = (pokemon) => {
  store.dispatch('pokemon/fetchPokemonDetails', pokemon.url);
};

const handleFilterChange = (filters) => {
  store.dispatch('pokemon/applyFilters', filters);
};

const loadMorePokemon = () => {
  if (!isLoading.value) {
    store.dispatch('pokemon/fetchPokemonList');
  }
};

onMounted(() => {
  store.dispatch('pokemon/resetPokemonState');
  store.dispatch('pokemon/fetchPokemonList');
});
</script>

<style lang="scss" scoped>
@use './styles.modules.scss' as *;
</style>