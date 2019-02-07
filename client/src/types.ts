import { ethers } from 'ethers';
import { Contracts, Fund } from '@dfund/lib';

export interface Balances {
  [currency: string]: {
    value: string;
    usd: number;
  };
}

export interface FundState {
  list: Fund[];
}

export interface EnsState {
  address: string;
}

export interface IdentityState {
  address: string;
  ensName: string;
  balances: Balances;
}

export interface WalletState {
  local: {
    address: string,
    privateKey: string,
  };
  remote: {
    address: string;
    privateKey: string;
    mnemonic: string;
    balances: Balances;
  };
}

export interface RootState {
  network: ethers.utils.Network;
  contracts: Contracts;
  provider: ethers.providers.JsonRpcProvider;
  ready: boolean;
  ethUsdPrice: number;
  ens: EnsState;
  identity: IdentityState;
  wallet: WalletState;
  fund: FundState;
}
