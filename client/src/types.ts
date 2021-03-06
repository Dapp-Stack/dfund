import { ethers } from 'ethers';
import { Contracts, Fund } from '@dfund/lib';

export interface Balances {
  [currency: string]: string;
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
  prices: {
    ETH: number;
    SNT: number;
    DAS: number;
    AAPL: number;
  };
  ens: EnsState;
  identity: IdentityState;
  wallet: WalletState;
  fund: FundState;
}
