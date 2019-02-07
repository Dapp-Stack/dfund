import { ethers } from 'ethers';
import { Fund, calculateHash, Message } from '@dfund/lib';
import { RootState } from '../types';
import { BigNumber } from 'ethers/utils';
import { get, add } from './ipfsService';

import identityJson from '../../contracts/Identity/Identity.sol/Identity.json';
import fundJson from '../../contracts/Fund/Fund.sol/Fund.json';

export const buildFund = async (data: string[],
                                    signers: string[],
                                    rootState: RootState): Promise<Fund> => {
  const description = await get(rootState.ipfsClient, data[2]);
  return {
    address: data[0] as string,
    title: data[1] as string,
    description,
    expireOn: new Date(parseInt(data[3], 10)),
    signers,
  };
};

export const buildSignInput = async (rootState: RootState, fund: Fund) => {
  const message: Message =  {
    ...await buildDefaultMessage(rootState),
    gasLimit: new BigNumber(150000),
    to: fund.address,
    data: new ethers.utils.Interface(fundJson.abi).functions.sign.encode([]),
  };

  return await finalizeMessage(message, rootState);
};

export const buildCreateInput = async (rootState: RootState, fund: Fund) => {
  const descriptionHash = await add(rootState.ipfsClient, fund.description);
  const params = [fund.title, descriptionHash, fund.expireOn.getTime()];

  const message: Message =  {
    ...await buildDefaultMessage(rootState),
    gasLimit: new BigNumber(1000000),
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
    gasToken: rootState.contracts.ERC20Mintable[0].address,
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

