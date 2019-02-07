import { utils } from 'ethers';
import { Commit } from 'vuex';
import { RootState } from '../types';
import cc from 'cryptocompare';
import axios from 'axios';

export const updateBalances = async (commit: Commit, rootState: RootState, address: string) => {
  const wei = await getWeiBalance(rootState, address);
  const ethPrice = await cc.price('ETH', ['USD']);
  commit('updateBalance', {name: 'ETH', value: utils.formatEther(wei), usd: ethPrice.USD});

  const das = await getDASBalance(rootState, address);
  commit('updateBalance', {name: 'DAS', value: utils.formatEther(das), usd: ethPrice.USD});

  const snt = await getSNTBalance(rootState, address);
  const sntPrice = await cc.price('SNT', ['USD']);
  commit('updateBalance', {name: 'SNT', value: snt.toString(), usd: sntPrice.USD});

  const aapl = await getAAPLBalance(rootState, address);
  const price = await getAAPLPrice();
  commit('updateBalance', {name: 'AAPL', value: aapl.toString(), usd: price});
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

export const getAAPLPrice = async () => {
  const response = await axios({
    url: 'https://api.iextrading.com/1.0/tops/last?symbols=AAPL',
    method: 'GET',
  });
  return response.data[0].price;
};

export const getWeiBalance = async (rootState: RootState, address: string) => {
  return await rootState.provider.getBalance(address);
};

