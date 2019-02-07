import axios from 'axios';
import { Module, ActionTree, MutationTree } from 'vuex';
import { waitForTransactionReceipt, extractTransactionEvents, Fund } from '@dfund/lib';
import { ethers } from 'ethers';

import { apiUrl } from '../../config';
import { RootState, FundState } from '../../types';
import { buildFund, buildCreateInput, buildSignInput } from '../../services/fundService';
import fundJson from '../../../contracts/Fund/Fund.sol/Fund.json';

export const defaultState: FundState = {
  list: [],
};

export const actions: ActionTree<FundState, RootState> = {
  async create({ commit, rootState, dispatch }, payload: Fund) {
    const data = await buildCreateInput(rootState, payload);
    const response = await axios({
      url: `${apiUrl}/identity/execution`,
      method: 'POST',
      data,
    });
    const transaction: ethers.utils.Transaction = response && response.data;
    if (!transaction.hash) {
      return;
    }
    const receipt = await waitForTransactionReceipt(rootState.provider, transaction.hash);
    const txEvents = extractTransactionEvents(receipt, rootState.contracts.Controller[0]);
    if (!txEvents.FundCreated) {
      return;
    }
    const result = await buildFund(Object.values(txEvents.FundCreated), [], rootState);
    commit('addFund', result);
    dispatch('identity/fetchBalances', {}, { root: true });
  },
  async sign({ commit, rootState, dispatch }, payload: Fund) {
    if (!payload.address) {
      return;
    }
    const data = await buildSignInput(rootState, payload);
    const response = await axios({
      url: `${apiUrl}/identity/execution`,
      method: 'POST',
      data,
    });
    const transaction: ethers.utils.Transaction = response && response.data;
    if (!transaction.hash) {
      return;
    }
    const receipt = await waitForTransactionReceipt(rootState.provider, transaction.hash);
    const contract = new ethers.Contract(payload.address, fundJson.abi, rootState.provider);
    const txEvents = extractTransactionEvents(receipt, contract);
    if (!txEvents.FundSigned) {
      return;
    }
    commit('signFund', {address: payload.address, signer: txEvents.FundSigned[0]});
    dispatch('identity/fetchBalances', {}, { root: true });
  },
  async list({ commit, rootState }) {
    const controller = rootState.contracts.Controller[0];
    const addresses: string[] = await controller.getAddresses();

    const promises = addresses.map(async (address) => {
      const contract = new ethers.Contract(address, fundJson.abi, rootState.provider);
      const data = await contract.get();
      const signers = await contract.getSigners();
      return await buildFund(data, signers, rootState);
    });
    const funds: Fund[] = await Promise.all(promises);
    commit('updateFunds', funds);
  },
};

export const mutations: MutationTree<FundState> = {
  updateFunds(state, payload: Fund[]) {
    state.list = payload;
  },
  addFund(state, payload: Fund) {
    state.list.push(payload);
  },
  signFund(state, payload: { address: string, signer: string}) {
    const foundedFund = state.list.find((p) => p.address === payload.address);
    if (!foundedFund) {
      return;
    }
    foundedFund.signers.push(payload.signer);
  },
};

const namespaced: boolean = true;

const fund: Module<FundState, RootState> = {
  namespaced,
  state: defaultState,
  actions,
  mutations,
};

export default fund;
