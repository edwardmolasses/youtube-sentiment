import { ethers, Wallet } from "ethers";
import { BigNumber } from "bignumber.js";
import uniswapTokenDict from '../data/uniswapTokenList.json';
import { UniswappyV2EthPair } from "../utils/UniswappyV2EthPair";

type Token = {
  address: string;
  symbol: string;
  decimals: number;
};

type LiquidityPool = {
  _tokens: string[];
  _marketAddress: string;
  _protocol: string;
  _tokenBalances: { [key: string]: { type: string, hex: string } };
  UNISWAP_LOOKUP_CONTRACT_ADDRESS: string;
};

export const ETHER = ethers.BigNumber.from(10).pow(18);

export function findContractAddress(symbol: string, tokenList: Token[]): string | null {
  for (let token of tokenList) {
    if (token.symbol === symbol) {
      return token.address;
    }
  }
  return null;
}

export function findContractDecimals(symbol: string, tokenList: Token[]): number | null {
  for (let token of tokenList) {
    if (token.symbol === symbol) {
      return token.decimals;
    }
  }
  return null;
}

function findDecimalsFromContractAddress(contractAddress: string, tokenList: Token[]): number | null {
  for (let i = 0; i < tokenList.length; i++) {
    if (tokenList[i].address === contractAddress) {
      return tokenList[i].decimals;
    }
  }
  return null;
}

export function bigNumberToDecimal(value: ethers.BigNumber, base = 18): number {
  const divisor = ethers.BigNumber.from(10).pow(base)
  return value.mul(10000).div(divisor).toNumber() / 10000
}

export function getDefaultRelaySigningKey(): string {
  console.warn("You have not specified an explicity FLASHBOTS_RELAY_SIGNING_KEY environment variable. Creating random signing key, this searcher will not be building a reputation for next run")
  return Wallet.createRandom().privateKey;
}

export function findTokenByAddressFromDict(contractAddress: string): Token | undefined {
  return uniswapTokenDict.find(token => token.address === contractAddress);
}

export function convertPoolsToPrices(pools: UniswappyV2EthPair[]): { symbol: string, priceInUsdc: number }[] {
  const tokenList = uniswapTokenDict;
  const usdcAddress = findContractAddress("USDC", tokenList);
  const usdcDecimals = findContractDecimals("USDC", tokenList);
  if (!usdcAddress || !usdcDecimals) {
    throw new Error("USDC address not found");
  }
  const wethAddress = findContractAddress("WETH", tokenList);
  const wethDecimals = findContractDecimals("WETH", tokenList);
  if (!wethAddress || !wethDecimals) {
    throw new Error("WETH address not found");
  }

  const usdcPool = pools.find(pool => pool.getTokens().includes(usdcAddress));
  if (!usdcPool) {
    throw new Error("USDC pool not found");
  }

  const usdcBalanceInWei = new BigNumber(usdcPool.getTokenBalances()[usdcAddress]._hex);
  const wethBalanceInWei = new BigNumber(usdcPool.getTokenBalances()[wethAddress]._hex);
  const adjustedBalanceUsdc = usdcBalanceInWei.dividedBy(10 ** usdcDecimals);
  const adjustedBalanceWeth = wethBalanceInWei.dividedBy(10 ** wethDecimals);
  const priceUsdcInWeth = adjustedBalanceUsdc.dividedBy(adjustedBalanceWeth);
  const uniqueSymbols = new Set<string>(); // To filter out repeated symbols

  const result = pools
    .filter(pool => pool.getTokens().includes(wethAddress) && !pool.getTokens().includes(usdcAddress))
    .map(pool => {
      const otherTokenAddress = pool.getTokens().find(address => address !== wethAddress);
      if (!otherTokenAddress) {
        return null;
      }

      const wethBalanceInWei = new BigNumber(pool.getTokenBalances()[wethAddress]._hex);
      const otherTokenBalanceInWei = new BigNumber(pool.getTokenBalances()[otherTokenAddress]._hex);
      const otherTokenDecimals = findDecimalsFromContractAddress(otherTokenAddress, tokenList);
      if (otherTokenDecimals === null) {
        return null;  // Skip this token if decimals not found
      }

      const adjustedBalanceOtherToken = otherTokenBalanceInWei.dividedBy(10 ** otherTokenDecimals);
      const adjustedBalanceWeth = wethBalanceInWei.dividedBy(10 ** wethDecimals);

      const otherTokenPricePerWeth = adjustedBalanceOtherToken.dividedBy(adjustedBalanceWeth);
      const priceInUsdc = priceUsdcInWeth.dividedBy(otherTokenPricePerWeth).toNumber();

      const otherToken = tokenList.find(token => token.address === otherTokenAddress);
      if (!otherToken || uniqueSymbols.has(otherToken.symbol)) {
        return null;
      }

      uniqueSymbols.add(otherToken.symbol);

      return {
        symbol: otherToken.symbol,
        priceInUsdc
      };
    })
    .filter(item => item !== null) as { symbol: string, priceInUsdc: number }[];

  return result;
}
