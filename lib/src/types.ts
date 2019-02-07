import { ethers, utils } from "ethers";

export interface Tracker {
  [chainId: string]: {
    [address: string]: {
      name: string;
      abi: Array<any>;
    }
  }
}

export interface Fund {
  address?: string;
  name: string;
  symbol: string;
  tokens: {
    [address: string]: number;
  };
  supply: number;
  democracy: string;
}

export interface Contracts {
  [name: string]: ethers.Contract[];
};

export interface Message extends utils.Transaction {
  gasToken: string;
  operationType: string;
}
