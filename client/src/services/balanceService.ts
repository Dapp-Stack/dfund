import { utils } from 'ethers';
import { Commit } from 'vuex';
import { RootState } from '../types';

export const updateBalances = async (commit: Commit, rootState: RootState, address: string) => {
  const wei = await getWeiBalance(rootState, address);
  commit('updateBalance', {name: 'ETH', value: utils.formatEther(wei)});

  const das = await getDASBalance(rootState, address);
  commit('updateBalance', {name: 'DAS', value: utils.formatEther(das)});

  const snt = await getSNTBalance(rootState, address);
  commit('updateBalance', {name: 'SNT', value: snt.toString()});

  const aapl = await getAAPLBalance(rootState, address);
  commit('updateBalance', {name: 'AAPL', value: aapl.toString()});
};

export const getDASBalance = async (rootState: RootState, address: string) => {
  const token = rootState.contracts.DasToken[0];
  return await token.balanceOf(address);
};

export const getSNTBalance = async (rootState: RootState, address: string) => {
  const token = rootState.contracts.SntToken[0];
  return await token.balanceOf(address);
};

export const getAAPLBalance = async (rootState: RootState, address: string) => {
  const token = rootState.contracts.AaplToken[0];
  return await token.balanceOf(address);
};

export const getWeiBalance = async (rootState: RootState, address: string) => {
  return await rootState.provider.getBalance(address);
};

