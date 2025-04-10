<template>
  <div class="evolution-item">
    <div class="evolution-pokemon">
      <img :src="pokemon.image" :alt="pokemon.name">
      <p>{{ formattedName }}</p>
    </div>
    <div v-if="!isLast" class="evolution-arrow">
      <span>→</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PokemonEvolution',
  props: {
    pokemon: {
      type: Object,
      required: true
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    formattedName() {
      return this.pokemon.name.charAt(0).toUpperCase() + this.pokemon.name.slice(1);
    }
  }
};
</script>

<style lang="scss" scoped>
@use './styles.modules.scss' as *;
</style>