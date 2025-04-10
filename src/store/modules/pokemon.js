import pokeApi from "../../services/pokeApi";

const state = {
  pokemonList: [],
  filteredPokemonList: [],
  currentPokemon: null,
  nextUrl: "https://pokeapi.co/api/v2/pokemon?limit=20",
  isLoading: false,
  modalOpen: false,
  evolutionChain: [],
  activeFilters: null,
  hasMorePokemon: true,
  filters: {
    name: "",
    id: null,
    type: "",
    species: "",
  },
};

const mutations = {
  SET_POKEMON_LIST(state, pokemonList) {
    state.pokemonList = pokemonList;
    state.filteredPokemonList = pokemonList;
  },
  ADD_POKEMON_LIST(state, pokemonList) {
    state.pokemonList = [...state.pokemonList, ...pokemonList];
    state.filteredPokemonList = [...state.pokemonList];
  },
  SET_NEXT_URL(state, url) {
    state.nextUrl = url;
    state.hasMorePokemon = !!url;
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_CURRENT_POKEMON(state, pokemon) {
    state.currentPokemon = pokemon;
  },
  SET_MODAL_OPEN(state, isOpen) {
    state.modalOpen = isOpen;
  },
  SET_EVOLUTION_CHAIN(state, evolutionChain) {
    state.evolutionChain = evolutionChain;
  },
  SET_ACTIVE_FILTERS(state, filters) {
    state.activeFilters = filters;
  },
  RESET_POKEMON_STATE(state) {
    state.pokemonList = [];
    state.filteredPokemonList = [];
    state.nextUrl = "https://pokeapi.co/api/v2/pokemon?limit=20";
    state.activeFilters = null;
    state.hasMorePokemon = true;
  },
  UPDATE_FILTER(state, { key, value }) {
    state.filters[key] = value;
  },
  RESET_FILTERS(state) {
    state.filters = {
      name: "",
      id: null,
      type: "",
      species: "",
    };
    state.pokemonList = [];
    state.filteredPokemonList = [];
    state.nextUrl = "https://pokeapi.co/api/v2/pokemon?limit=20";
    state.activeFilters = null;
    state.hasMorePokemon = true;
  },
};

const prepareFilters = (filters) => {
  return {
    name: filters.name?.trim() || undefined,
    id: filters.id || undefined,
    type: filters.type || undefined,
    species: filters.species?.trim() || undefined,
  };
};

const actions = {
  async fetchPokemonList({ commit, state }) {
    if (!state.nextUrl || state.isLoading || !state.hasMorePokemon) return;

    try {
      commit("SET_LOADING", true);

      const response = await pokeApi.get(state.nextUrl);
      commit("SET_NEXT_URL", response.data.next);

      const pokemonPromises = response.data.results.map(async (pokemon) => {
        const detailsResponse = await pokeApi.get(pokemon.url);
        const pokemonData = detailsResponse.data;

        return {
          id: pokemonData.id,
          name: pokemonData.name,
          types: pokemonData.types,
          image:
            pokemonData.sprites.other.showdown["front_default"] ||
            pokemonData.sprites.other["official-artwork"].front_default ||
            pokemonData.sprites.front_default,
          url: pokemon.url,
          species: pokemonData.species,
          moves: pokemonData.moves,
          abilities: pokemonData.abilities,
          stats: pokemonData.stats,
          height: pokemonData.height,
        };
      });

      const pokemonList = await Promise.all(pokemonPromises);

      commit("ADD_POKEMON_LIST", pokemonList);
    } catch (error) {
      console.error("Error fetching Pokemon list:", error);
      commit("SET_NEXT_URL", null);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async resetAndFetchAll({ commit, dispatch }) {
    commit("RESET_POKEMON_STATE");
    commit("SET_ACTIVE_FILTERS", null);
    await dispatch("fetchPokemonList");
  },

  async fetchPokemonDetails({ commit }, url) {
    try {
      commit("SET_LOADING", true);

      const response = await pokeApi.get(url);
      const pokemon = response.data;

      const speciesResponse = await pokeApi.get(pokemon.species.url);
      const evolutionResponse = await pokeApi.get(
        speciesResponse.data.evolution_chain.url
      );

      commit("SET_CURRENT_POKEMON", pokemon);
      commit("SET_MODAL_OPEN", true);

      const evolutionChain = [];
      let evoData = evolutionResponse.data.chain;

      const getEvolutionDetails = async (evoData) => {
        const speciesName = evoData.species.name;
        const pokemonResponse = await pokeApi.get(
          `https://pokeapi.co/api/v2/pokemon/${speciesName}`
        );

        return {
          id: pokemonResponse.data.id,
          name: speciesName,
          image:
            pokemonResponse.data.sprites.other["official-artwork"]
              .front_default || pokemonResponse.data.sprites.front_default,
        };
      };

      const processEvolutionChain = async (evoData, chain = []) => {
        const pokemon = await getEvolutionDetails(evoData);
        chain.push(pokemon);

        if (evoData.evolves_to.length > 0) {
          for (const evolution of evoData.evolves_to) {
            await processEvolutionChain(evolution, chain);
          }
        }

        return chain;
      };

      const evolutionData = await processEvolutionChain(evoData);
      commit("SET_EVOLUTION_CHAIN", evolutionData);
    } catch (error) {
      console.error("Error fetching Pokemon details:", error);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  closeModal({ commit }) {
    commit("SET_MODAL_OPEN", false);
    commit("SET_CURRENT_POKEMON", null);
    commit("SET_EVOLUTION_CHAIN", []);
  },

  resetPokemonState({ commit }) {
    commit("RESET_POKEMON_STATE");
  },

  resetFilters({ commit, dispatch }) {
    commit("RESET_FILTERS");
    dispatch("fetchPokemonList");
  },

  async fetchPokemonByFilters({ commit, state, dispatch }) {
    const cleanFilters = prepareFilters(state.filters);
    const hasActiveFilters = Object.values(cleanFilters).some(
      (value) => value !== undefined
    );

    if (!hasActiveFilters) {
      return dispatch("resetAndFetchAll");
    }

    commit("SET_LOADING", true);
    commit("RESET_POKEMON_STATE");
    commit("SET_ACTIVE_FILTERS", cleanFilters);

    try {
      let pokemonList = [];

      if (cleanFilters.id || cleanFilters.name) {
        const identifier = cleanFilters.id || cleanFilters.name.toLowerCase();
        try {
          const response = await pokeApi.get(
            `https://pokeapi.co/api/v2/pokemon/${identifier}`
          );
          const pokemonData = response.data;
          const pokemon = {
            id: pokemonData.id,
            name: pokemonData.name,
            types: pokemonData.types,
            image:
              pokemonData.sprites.other?.showdown?.["front_default"] ||
              pokemonData.sprites.other["official-artwork"].front_default ||
              pokemonData.sprites.front_default,
            url: `https://pokeapi.co/api/v2/pokemon/${pokemonData.id}/`,
            species: pokemonData.species,
            moves: pokemonData.moves,
            abilities: pokemonData.abilities,
            stats: pokemonData.stats,
            height: pokemonData.height,
          };

          pokemonList = [pokemon];
        } catch (error) {
          console.log(error);
          console.error(`Pokémon ${identifier} não encontrado:`, error);
          pokemonList = [];
        }
      } else if (cleanFilters.type) {
        const response = await pokeApi.get(
          `https://pokeapi.co/api/v2/type/${cleanFilters.type}`
        );
        const pokemonEntries = response.data.pokemon.slice(0, 50);

        const pokemonDetails = await Promise.all(
          pokemonEntries.map(async (entry) => {
            try {
              const res = await pokeApi.get(entry.pokemon.url);
              const p = res.data;

              if (
                cleanFilters.species &&
                !p.species.name
                  .toLowerCase()
                  .includes(cleanFilters.species.toLowerCase())
              ) {
                return null;
              }

              return {
                id: p.id,
                name: p.name,
                types: p.types,
                image:
                  p.sprites.other.showdown["front_default"] ||
                  p.sprites.other["official-artwork"].front_default ||
                  p.sprites.front_default,
                url: entry.pokemon.url,
                species: p.species,
                moves: p.moves,
                abilities: p.abilities,
                stats: p.stats,
                height: p.height,
              };
            } catch (error) {
              console.error(
                `Erro ao buscar detalhes do Pokémon ${entry.pokemon.name}:`,
                error
              );
              return null;
            }
          })
        );

        pokemonList = pokemonDetails.filter((pokemon) => pokemon !== null);
      } else if (cleanFilters.species) {
        const response = await pokeApi.get(
          `https://pokeapi.co/api/v2/pokemon?limit=100`
        );

        const pokemonDetails = await Promise.all(
          response.data.results.map(async (pokemon) => {
            try {
              const res = await pokeApi.get(pokemon.url);
              const p = res.data;
              const speciesRes = await pokeApi.get(p.species.url);
              const speciesData = speciesRes.data;
              const matchesSpecies = speciesData.names.some(
                (name) =>
                  name.language.name === "en" &&
                  name.name
                    .toLowerCase()
                    .includes(cleanFilters.species.toLowerCase())
              );

              const matchesGenus = speciesData.genera.some(
                (genus) =>
                  genus.language.name === "en" &&
                  genus.genus
                    .toLowerCase()
                    .includes(cleanFilters.species.toLowerCase())
              );

              if (matchesSpecies || matchesGenus) {
                return {
                  id: p.id,
                  name: p.name,
                  types: p.types,
                  image:
                    p.sprites.other.showdown["front_default"] ||
                    p.sprites.other["official-artwork"].front_default ||
                    p.sprites.front_default,
                  url: pokemon.url,
                  species: {
                    ...p.species,
                    details: speciesData,
                  },
                  moves: p.moves,
                  abilities: p.abilities,
                  stats: p.stats,
                  height: p.height,
                };
              }

              return null;
            } catch (error) {
              console.error(
                `Erro ao buscar detalhes do Pokémon ${pokemon.name}:`,
                error
              );
              return null;
            }
          })
        );
        pokemonList = pokemonDetails.filter((pokemon) => pokemon !== null);
      } else {
        const response = await pokeApi.get(
          `https://pokeapi.co/api/v2/pokemon?limit=20`
        );

        const pokemonDetails = await Promise.all(
          response.data.results.map(async (pokemon) => {
            try {
              const res = await pokeApi.get(pokemon.url);
              const p = res.data;

              return {
                id: p.id,
                name: p.name,
                types: p.types,
                image:
                  p.sprites.other.showdown["front_default"] ||
                  p.sprites.other["official-artwork"].front_default ||
                  p.sprites.front_default,
                url: pokemon.url,
                species: p.species,
                moves: p.moves,
                abilities: p.abilities,
                stats: p.stats,
                height: p.height,
              };
            } catch (error) {
              console.error(
                `Erro ao buscar detalhes do Pokémon ${pokemon.name}:`,
                error
              );
              return null;
            }
          })
        );

        pokemonList = pokemonDetails.filter((pokemon) => pokemon !== null);
        commit("SET_NEXT_URL", response.data.next);
      }
      commit("SET_POKEMON_LIST", pokemonList);
      if (
        cleanFilters.id ||
        cleanFilters.name ||
        cleanFilters.type ||
        cleanFilters.species
      ) {
        commit("SET_NEXT_URL", null);
      }
    } catch (error) {
      console.error("Erro ao buscar pokémons filtrados:", error);
      commit("SET_NEXT_URL", null);
      commit("SET_POKEMON_LIST", []);
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const getters = {
  allPokemon: (state) => state.pokemonList,
  filteredPokemon: (state) => state.filteredPokemonList,
  isLoading: (state) => state.isLoading,
  currentPokemon: (state) => state.currentPokemon,
  modalOpen: (state) => state.modalOpen,
  evolutionChain: (state) => state.evolutionChain,
  hasMorePokemon: (state) => state.hasMorePokemon,
  currentFilters: (state) => state.filters,
  hasActiveFilters: (state) => {
    const { name, id, type, species } = state.filters;
    return !!(name || id || type || species);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
