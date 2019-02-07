import { utils } from 'ethers';
import { Commit } from 'vuex';
import { RootState } from '../types';

export const updateBalances = async (commit: Commit, rootState: RootState, address: string) => {
  const wei = await getWeiBalance(rootState, address);
  commit('updateBalance', {name: 'ETH', value: utils.formatEther(wei)});

  const ppt = await getDASBalance(rootState, address);
  commit('updateBalance', {name: 'DAS', value: utils.formatEther(ppt)});
};

export const getDASBalance = async (rootState: RootState, address: string) => {
  const token = rootState.contracts.DasToken[0];
  return await token.balanceOf(address);
};

export const getWeiBalance = async (rootState: RootState, address: string) => {
  return await rootState.provider.getBalance(address);
};

