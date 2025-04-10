<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content" v-if="currentPokemon">
      <div class="modal-header">
        <h2>{{ formattedName }}</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="pokemon-details">
          <div class="pokemon-info">
            <div class="pokemon-id">#{{ currentPokemon.id }}</div>
            <div class="pokemon-types">
              <span 
                v-for="(type, index) in currentPokemon.types" 
                :key="index" 
                :class="['pokemon-type', `pokemon-type--${type.type.name}`]"
              >
                {{ type.type.name }}
              </span>
            </div>
          </div>
          <div class="section">
            <h3>Sprites</h3>
            <div class="sprites-grid">
              <div v-if="currentPokemon.sprites.front_default">
                <img :src="currentPokemon.sprites.front_default" alt="Front Default">
                <p>Front Default</p>
              </div>
              <div v-if="currentPokemon.sprites.back_default">
                <img :src="currentPokemon.sprites.back_default" alt="Back Default">
                <p>Back Default</p>
              </div>
              <div v-if="currentPokemon.sprites.front_shiny">
                <img :src="currentPokemon.sprites.front_shiny" alt="Front Shiny">
                <p>Front Shiny</p>
              </div>
              <div v-if="currentPokemon.sprites.back_shiny">
                <img :src="currentPokemon.sprites.back_shiny" alt="Back Shiny">
                <p>Back Shiny</p>
              </div>
              <div v-if="currentPokemon.sprites.other && currentPokemon.sprites.other['official-artwork'].front_default">
                <img :src="currentPokemon.sprites.other['official-artwork'].front_default" alt="Official Artwork">
                <p>Official Artwork</p>
              </div>
            </div>
          </div>
          <div class="section" v-if="evolutionChain.length > 0">
            <h3>Evoluções</h3>
            <div class="evolution-chain">
              <pokemon-evolution 
                v-for="(evolution, index) in evolutionChain" 
                :key="evolution.id" 
                :pokemon="evolution" 
                :isLast="index === evolutionChain.length - 1"
              />
            </div>
          </div>
          <div class="section">
            <h3>Movimentos</h3>
            <div class="moves-list">
              <div v-for="(move, index) in currentPokemon.moves.slice(0, 20)" :key="index" class="move-item">
                {{ formatMoveName(move.move.name) }}
              </div>
              <div v-if="currentPokemon.moves.length > 20" class="more-moves">
                E mais {{ currentPokemon.moves.length - 20 }} movimentos...
              </div>
            </div>
          </div>
          <div class="section">
            <h3>Jogos</h3>
            <div class="games-list">
              <div v-for="(game, index) in currentPokemon.game_indices" :key="index" class="game-item">
                {{ formatGameName(game.version.name) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import PokemonEvolution from '../PokemonEvolution/PokemonEvolution.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'PokemonModal',
  components: {
    PokemonEvolution
  },
  computed: {
    ...mapGetters('pokemon', ['currentPokemon', 'evolutionChain']),
    formattedName() {
      return this.currentPokemon.name.charAt(0).toUpperCase() + this.currentPokemon.name.slice(1);
    }
  },
  methods: {
    ...mapActions('pokemon', ['closeModal']),
    formatMoveName(name) {
      return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },
    formatGameName(name) {
      return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  },
  created() {
  },
  beforeDestroy() {
  }
};
</script>

<style lang="scss" scoped>
@use './styles.modules.scss' as *;
</style>