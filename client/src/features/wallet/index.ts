import { Module, ActionTree, MutationTree } from 'vuex';
import Vue from 'vue';
import { ethers } from 'ethers';
import { waitForTransactionReceipt } from '@dfund/lib';

import { RootState, WalletState } from '../../types';
import { buildWallet } from '../../services/walletService';
import { updateBalances } from '../../services/balanceService';

export const defaultState: WalletState = {
  local: {
    address: '',
    privateKey: '',
  },
  remote: {
    privateKey: '',
    mnemonic: '',
    address: '',
    balances: {},
  },
};

export const actions: ActionTree<WalletState, RootState> = {
  destroy({ commit, dispatch }) {
    commit('clean');
    dispatch('generateLocal');
  },
  generateLocal({ commit, rootState, state }) {
    if (state.local.address && state.local.privateKey) {
      return;
    }

    const privateKey = ethers.Wallet.createRandom().privateKey;
    const localWallet = buildWallet(rootState.provider, privateKey);
    commit('setLocal', { privateKey, address: localWallet.address });
  },
  async generateRemote({ commit, rootState }, payload: { privateKey?: string, mnemonic?: string}) {
    const { privateKey, mnemonic } = payload;
    const remoteWallet = buildWallet(rootState.provider, privateKey, mnemonic);
    commit('setRemote', { privateKey, mnemonic, address: remoteWallet.address, balances: {} });

    await updateBalances(commit, rootState, remoteWallet.address);
  },
  async buyToken({ commit, state, rootState, dispatch }, payload: { name: string, value: ethers.utils.BigNumber }) {
    const overrides = { value: payload.value };
    const remoteWallet = buildWallet(rootState.provider, state.remote.privateKey, state.remote.mnemonic);
    const crowdsale = (rootState.contracts[`${payload.name}Crowdsale`][0]).connect(remoteWallet);

    const transaction: ethers.utils.Transaction = await crowdsale.buyTokens(rootState.identity.address, overrides);
    if (!transaction.hash) {
      return;
    }
    await waitForTransactionReceipt(rootState.provider, transaction.hash);
    await updateBalances(commit, rootState, remoteWallet.address);
    dispatch('identity/fetchBalances', {}, { root: true });
  },
};

export const mutations: MutationTree<WalletState> = {
  setLocal(state, payload) {
    state.local = payload;
  },
  setRemote(state, payload) {
    state.remote = payload;
  },
  updateBalance(state, payload: { name: string, value: string, usd: number }) {
    Vue.set(state.remote.balances, payload.name, payload.value);
  },
  clean(state) {
    state.local = {
      address: '',
      privateKey: '',
    };
    state.remote = {
      privateKey: '',
      mnemonic: '',
      address: '',
      balances: {},
    };
  },
};

const namespaced: boolean = true;

const wallet: Module<WalletState, RootState> = {
  namespaced,
  state: defaultState,
  actions,
  mutations,
};

export default wallet;
