import axios from 'axios';
import Vue from 'vue';
import Vuex, { StoreOptions, MutationTree, ActionTree } from 'vuex';
import { Network } from 'ethers/utils';
import cc from 'cryptocompare';
import VuexPersist from 'vuex-persist';
import { Tracker, loadContracts } from '@dfund/lib';

import Authorisation from './features/authorisation';
import Ens, { defaultState as ensDefaultState } from './features/ens';
import Identity, { defaultState as identityDefaultState } from './features/identity';
import Fund, { defaultState as fundDefaultState } from './features/fund';
import Wallet, { defaultState as walletDefaultState } from './features/wallet';

import { apiUrl, provider } from './config';
import { RootState } from './types';

Vue.use(Vuex);

declare global {
  interface Window {
    web3?: any;
    ethereum?: any;
    tracker: Tracker;
  }
}

const NULL_NETWORK = {
  name: '',
  chainId: -1,
};

const defaultState: RootState = {
  network: NULL_NETWORK,
  contracts: {},
  ready: false,
  prices: {
    ETH: 0,
    SNT: 0,
    DAS: 0,
    AAPL: 0,
  },
  provider,
  identity: identityDefaultState,
  ens: ensDefaultState,
  fund: fundDefaultState,
  wallet: walletDefaultState,
};

const mutations: MutationTree<RootState> = {
  setRootState(state, payload) {
    state.network = payload.network;
    state.contracts = payload.contracts;
    state.ready = true;
  },
  updatePrices(state, payload) {
    state.prices = payload;
  },
};

const actions: ActionTree<RootState, RootState> = {
  async fetchPrice({ commit }) {
    const eth = await cc.price('ETH', ['USD']);
    const snt = await cc.price('SNT', ['USD']);
    const response = await axios({
      url: 'https://api.iextrading.com/1.0/tops/last?symbols=AAPL',
      method: 'GET',
    });
    const aapl = response.data[0].price;
    commit('updatePrices', { ETH: eth.USD, DAS: eth.USD, SNT: snt.USD, AAPL: aapl});
  },
  initPriceRoutine({ dispatch }) {
    setInterval(() => {
      dispatch('fetchPrice');
    }, 30000);
  },
  async init({ commit, dispatch }) {
    try {
      const response = await axios({ url: `${apiUrl}/config` });
      const payload: Network = response && response.data;
      const network = await provider.getNetwork();

      if (network.chainId !== payload.chainId) {
        throw new Error('Network do not correspond between client and api');
      }

      const contracts = loadContracts(network, window.tracker, provider);
      commit('setRootState', { network, contracts });
      dispatch('identity/fetchBalances', {}, { root: true });
      dispatch('fetchPrice');
      dispatch('initPriceRoutine');
    } catch (error) {
      commit('setRootState', { network: NULL_NETWORK, contract: {} });
    }
  },
};

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage,
  reducer: (state: RootState) => (
    {...state, ready: null, wallet: { ...state.wallet }}
  ),
});

const store: StoreOptions<RootState> = {
  state: defaultState,
  actions,
  mutations,
  modules: {
    ens: Ens,
    identity: Identity,
    authorisation: Authorisation,
    fund: Fund,
    wallet: Wallet,
  },
  plugins: [vuexLocalStorage.plugin],
};

export default new Vuex.Store<RootState>(store);
