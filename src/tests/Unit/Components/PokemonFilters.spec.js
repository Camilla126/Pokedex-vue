import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStore } from "vuex";
import App from "@/App.vue";
import { createI18n } from "vue-i18n";

vi.mock("@/components/PokemonList/PokemonList.vue", () => ({
  default: {
    name: "PokemonList",
    template: '<div class="pokemon-list-mock"></div>',
  },
}));

const i18n = createI18n({
  legacy: false,
  locale: "pt",
  messages: {
    pt: {
      "app.title": "Pokédex",
    },
  },
});

const createVuexStore = () => {
  return createStore({
    modules: {
      pokemon: {
        namespaced: true,
        state: {
          modalOpen: false,
          loading: false,
        },
        actions: {
          fetchPokemonList: vi.fn(),
        },
        getters: {
          modalOpen: (state) => state.modalOpen,
          isLoading: (state) => state.loading,
          hasActiveFilters: () => false,
          hasMorePokemon: () => true,
        },
      },
    },
  });
};

describe("App", () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = createVuexStore();

    wrapper = mount(App, {
      global: {
        plugins: [store, i18n],
        stubs: {
          "pokemon-list": true,
          "pokemon-modal": true,
          "loading-spinner": true,
          "language-selector": true,
        },
      },
    });
  });

  it("renderiza corretamente", () => {
    expect(wrapper.find("h1").text()).toBe("Pokédex");
    expect(wrapper.find(".main").exists()).toBe(true);
  });
});
