<template>
  <div class="pokemon-card" :class="`pokemon-card--${primaryType}`">
    <div class="pokemon-card__inner">
      <div class="pokemon-card__header">
        <div>
          <h2 class="pokemon-card__name">{{ formattedName }}   <span class="pokemon-card__id">#{{ pokemon.id.toString().padStart(3, '0') }}</span></h2>
          <p v-if="evolutionStage" class="pokemon-card__evolution">
            {{ $t('pokemon.card.stage') }}: {{ evolutionStage }}
          </p>
        </div>
        <div class="pokemon-card__types">
        <span
           v-for="(type, index) in pokemon.types"
           :key="index"
           :class="['pokemon-type', `pokemon-type--${type.type.name}`]"
        >
          {{ $t(`types.${type.type.name}`) }}
        </span>
      </div>
  
      </div>
      
      <div class="pokemon-card__image">
        <section>
          <img
             :src="pokemon.image"
             :alt="pokemon.name"
             loading="lazy"
             :style="{ height: `${dynamicHeight}px` }"
          />
        </section>
      </div>
      
      <p v-if="preEvolutionImage" class="pokemon-card__pre-evo">
        {{ $t('pokemon.card.preEvolution') }}:
        <img :src="preEvolutionImage" alt="Pré-evolução" class="pokemon-card__pre-evo-img" />
      </p>
      
      <p v-if="localizedDescription" class="pokemon-card__description">{{ localizedDescription }}</p>
      <p v-if="ability" class="pokemon-card__ability">{{ $t('pokemon.card.ability') }}: {{ formatAbilityName(ability) }}</p>
      <p v-if="firstTwoMoves.length" class="pokemon-card__moves">
        {{ $t('pokemon.card.attacks') }}: {{ formatMoveNames(firstTwoMoves).join(', ') }}
      </p>
      
      <div class="pokemon-card__stats">
        <div
           v-for="stat in pokemon.stats"
           :key="stat.stat.name"
           class="pokemon-card__stat"
        >
          <span>{{ $t(`pokemon.card.stats.${stat.stat.name}`) }}</span>
          <div class="pokemon-card__stat-bar">
            <div
               class="pokemon-card__stat-fill"
               :style="{ width: stat.base_stat + '%' }"
            >
              {{ stat.base_stat }}
            </div>
          </div>
        </div>
      </div>
        
    
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'PokemonCard',
  props: {
    pokemon: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t, locale } = useI18n();

    const formattedName = computed(() => {
      return props.pokemon.name.charAt(0).toUpperCase() + props.pokemon.name.slice(1);
    });

    const primaryType = computed(() => {
      return props.pokemon.types[0]?.type?.name || 'normal';
    });

    const localizedDescription = computed(() => {
      const currentLangEntry = props.pokemon.species?.flavor_text_entries?.find(
        entry => entry.language.name === locale.value
      );

      const englishEntry = props.pokemon.species?.flavor_text_entries?.find(
        entry => entry.language.name === 'en'
      );
      
      const entry = currentLangEntry || englishEntry;
      return entry?.flavor_text?.replace(/\f/g, ' ') || '';
    });

    const evolutionStage = computed(() => {
      return props.pokemon.evolutionStage || '';
    });

    const preEvolutionImage = computed(() => {
      return props.pokemon.preEvolution?.image || '';
    });

    const ability = computed(() => {
      return props.pokemon.abilities?.[0]?.ability?.name || '';
    });

    const firstTwoMoves = computed(() => {
      return props.pokemon.moves?.slice(0, 2).map(move => move.move.name) || [];
    });

    const dynamicHeight = computed(() => {
      const height = props.pokemon.height || 0;
      
      if (height <= 9) {
        return 90;
      } else if (height <= 15) {
        return 130;
      } else {
        return 180;
      }
    });

    const formatAbilityName = (name) => {
      return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatMoveNames = (moves) => {
      return moves.map(name => name.split('-').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '));
    };

    return {
      formattedName,
      primaryType,
      localizedDescription,
      evolutionStage,
      preEvolutionImage,
      ability,
      firstTwoMoves,
      dynamicHeight,
      formatAbilityName,
      formatMoveNames
    };
  }
};
</script>

<style lang="scss" scoped>
@use './styles.modules.scss' as *;
</style>