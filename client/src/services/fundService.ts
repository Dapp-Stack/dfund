import { ethers } from 'ethers';
import { Fund, calculateHash, Message } from '@dfund/lib';
import { RootState } from '../types';
import { BigNumber } from 'ethers/utils';

import identityJson from '../../contracts/Identity/Identity.sol/Identity.json';
import fundJson from '../../contracts/Fund/Fund.sol/Fund.json';

export const buildFund = (data: any[]): Fund => {
  return {
    address: data[0] as string,
    name: data[1] as string,
    symbol: data[2] as string,
    supply: data[3].toNumber() as number,
    democracy: data[4] as string,
    tokens: data[5].reduce((acc: any, address: string, index: number) => {
      acc[address] = data[6][index].toNumber();
      return acc;
    }, {}),
  };
};

export const buildMintInput = async (rootState: RootState, fund: Fund, token: string, value: number) => {
  const params = [rootState.identity.address, value, ethers.utils.formatBytes32String("")];
  const contract = Object.values(rootState.contracts).map((c) => c[0]).find(c => c.address === token);
  if (!contract) {
    return;
  }
  const message: Message =  {
    ...await buildDefaultMessage(rootState),
    gasLimit: new BigNumber(2200000),
    to: fund.address,
    data: contract.interface.functions.approveAndCall.encode(params),
  };

  return await finalizeMessage(message, rootState);
};

export const buildCreateInput = async (rootState: RootState, fund: Fund) => {
  const params = [fund.name, fund.symbol, Object.keys(fund.tokens), Object.values(fund.tokens)];

  const message: Message =  {
    ...await buildDefaultMessage(rootState),
    gasLimit: new BigNumber(2200000),
    to: rootState.contracts.Controller[0].address,
    data: rootState.contracts.Controller[0].interface.functions.create.encode(params),
  };

  return await finalizeMessage(message, rootState);
};

const buildDefaultMessage = async (rootState: RootState) => {
  const nonce = await getIdentityLastNonce(rootState);
  return {
    from: rootState.identity.address,
    value: new BigNumber(0),
    gasToken: rootState.contracts.DasToken[0].address,
    operationType: '0',
    gasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(2000000000),
    chainId: rootState.network.chainId,
    nonce,
  };
};

const finalizeMessage = async (message: Message, rootState: RootState) => {
  const wallet = getWallet(rootState);
  const messageHash = calculateHash(message);
  const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
  return {...message, signature};
};

const getIdentityLastNonce = async (rootState: RootState) => {
  return await getIdentityContract(rootState).lastNonce();
};

const getIdentityContract = (rootState: RootState) => {
  const wallet = getWallet(rootState);
  return new ethers.Contract(rootState.identity.address, identityJson.abi, wallet);
};

const getWallet = (rootState: RootState) => {
  return new ethers.Wallet(rootState.wallet.local.privateKey, rootState.provider);
};

