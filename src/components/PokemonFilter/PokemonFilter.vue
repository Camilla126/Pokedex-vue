<template>
  <div class="pokemon-filters">
    <div class="pokemon-filters__header">
      <h3><span class="search-icon">🔍</span> {{ $t('pokemon.search') }}</h3>
    </div>
    <div class="filters-grid">
      <div class="filter-item">
        <label for="nameFilter">{{ $t('pokemon.filters.name') }}</label>
        <div class="input-wrapper">
          <input
            id="nameFilter"
            type="text"
            v-model="name"
            :placeholder="$t('pokemon.filters.placeholders.name')"
            :aria-label="$t('pokemon.filters.name')"
          />
        </div>
      </div>
      <div class="filter-item">
        <label for="idFilter">{{ $t('pokemon.filters.id') }}</label>
        <div class="input-wrapper">
          <input
            id="idFilter"
            type="number"
            min="1"
            v-model.number="id"
            :placeholder="$t('pokemon.filters.placeholders.id')"
            :aria-label="$t('pokemon.filters.id')"
          />
        </div>
      </div>
      <div class="filter-item">
        <label for="typeFilter">{{ $t('pokemon.filters.type') }}</label>
        <div class="select-wrapper">
          <select
            id="typeFilter"
            v-model="type"
            :aria-label="$t('pokemon.filters.type')"
          >
            <option value="">{{ $t('pokemon.filters.allTypes') }}</option>
            <option v-for="type in pokemonTypes" :key="type" :value="type">
              {{ $t(`types.${type}`) }}
            </option>
          </select>
          <div class="select-arrow">▼</div>
        </div>
      </div>
      <div class="filter-item">
        <label for="speciesFilter">{{ $t('pokemon.filters.species') }}</label>
        <div class="input-wrapper">
          <input
            id="speciesFilter"
            type="text"
            v-model="species"
            :placeholder="$t('pokemon.filters.placeholders.species')"
            :aria-label="$t('pokemon.filters.species')"
          />
        </div>
      </div>
    </div>
    <div class="filter-actions">
      <button class="reset-button" @click="resetFilters">
        <span class="reset-text">{{ $t('pokemon.filters.reset') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const pokemonTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

const previousName = ref('')
const previousId = ref(null)

const name = computed({
  get: () => store.state.pokemon.filters.name,
  set: (value) => {
    previousName.value = store.state.pokemon.filters.name
    store.commit('pokemon/UPDATE_FILTER', { key: 'name', value })
  }
})

const id = computed({
  get: () => store.state.pokemon.filters.id,
  set: (value) => {
    previousId.value = store.state.pokemon.filters.id
    store.commit('pokemon/UPDATE_FILTER', { key: 'id', value })
  }
})

const type = computed({
  get: () => store.state.pokemon.filters.type,
  set: (value) => store.commit('pokemon/UPDATE_FILTER', { key: 'type', value })
})

const species = computed({
  get: () => store.state.pokemon.filters.species,
  set: (value) => store.commit('pokemon/UPDATE_FILTER', { key: 'species', value })
})

const applyFilters = () => {
  store.dispatch('pokemon/fetchPokemonByFilters')
}

const debouncedSearch = debounce(() => {
  store.dispatch('pokemon/fetchPokemonByFilters')
}, 500)

watch([name, id, type, species], ([newName, newId, newType, newSpecies]) => {
  const nameWasCleared = previousName.value && !newName
  const idWasCleared = previousId.value && !newId

  if (nameWasCleared || idWasCleared) {
    const allFiltersEmpty = !newName && !newId && !newType && !newSpecies
    
    if (allFiltersEmpty) {
      store.dispatch('pokemon/resetAndFetchAll')
    } else {
      debouncedSearch()
    }
  } else {
    debouncedSearch()
  }
})

const resetFilters = () => {
  store.dispatch('pokemon/resetFilters')
}

onMounted(() => {
  if (!store.getters['pokemon/hasActiveFilters']) {
    store.dispatch('pokemon/fetchPokemonList')
  }
})
</script>

<style lang="scss" scoped>
@use './styles.modules.scss' as *;
</style>