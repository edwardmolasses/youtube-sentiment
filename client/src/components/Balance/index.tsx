import React, { Fragment, useState, useEffect } from 'react';
import { useMyContext } from '../../MyContextProvider';
import { ethers } from 'ethers';
import { Alchemy, Network, TokenBalanceType, TokenBalance } from 'alchemy-sdk';
import tokenList from '@uniswap/default-token-list/build/uniswap-default.tokenlist.json';

type EtherscanItem = {
  account: string;
  balance: string;
};

const config = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);
const zeroHexVal = '0x0000000000000000000000000000000000000000000000000000000000000000';

function findTokenByAddress(address: string) {
  // Find the token with the given address
  const token = tokenList.tokens.find((token) => token.address.toLowerCase() === address.toLowerCase());

  // If the token was found, return its symbol. Otherwise, return null.
  return token ? token : null;
}

function Balance() {
  const dataContext = useMyContext();
  const { moduleBalance, dragEnabled } = dataContext;
  const [walletAddress, setWalletAddress] = useState('');
  const [etherscanData, setEtherscanData] = useState([]);
  const [tokenBalances, setTokenBalances] = useState<
    { symbol: string | null; balance: string | null; decimals: number | null }[]
  >([]);
  const [weiPrice, setWeiPrice] = useState(0);
  const [fetchError, setFetchError] = useState(false); // New state for fetch error

  function getTokenBalanceFromHex(hexBalance: string, decimals: number) {
    return ethers.utils.formatUnits(hexBalance, decimals);
  }

  async function getTokens(address: string) {
    const balances = await alchemy.core.getTokenBalances(address, { type: TokenBalanceType.ERC20 });
    const nonZeroBalances = balances.tokenBalances.filter((token: TokenBalance) => {
      return token.tokenBalance !== zeroHexVal;
    });

    const tokenSymbolsAndBalances = [];
    for (let i = 0; i < nonZeroBalances.length; i++) {
      const token = balances.tokenBalances[i];
      const tokenLookup = findTokenByAddress(token.contractAddress);
      if (tokenLookup) {
        tokenSymbolsAndBalances.push({
          symbol: tokenLookup.symbol,
          balance: token.tokenBalance ? getTokenBalanceFromHex(token.tokenBalance, tokenLookup.decimals) : null,
          decimals: tokenLookup.decimals,
        });
      } else {
        // delay for rate limit
        await new Promise((resolve) => setTimeout(resolve, 10));
        try {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          tokenSymbolsAndBalances.push({
            symbol: metadata.symbol,
            balance:
              token.tokenBalance && metadata.decimals ? getTokenBalanceFromHex(token.tokenBalance, metadata.decimals) : null,
            decimals: metadata.decimals,
          });
        } catch (error) {
          console.error(`Failed to get metadata for token at address ${token.contractAddress}:`, error);
          tokenSymbolsAndBalances.push({ symbol: null, balance: token.tokenBalance, decimals: null });
        }
      }
    }

    const filteredTokenSymbolsAndBalances = tokenSymbolsAndBalances.filter((token) => {
      if (token.balance !== null) {
        return parseFloat(token.balance) > 0.0;
      }
      return false;
    });

    setTokenBalances(filteredTokenSymbolsAndBalances);
    console.log(filteredTokenSymbolsAndBalances);
  }

  useEffect(() => {
    const tradingWallet = '0x3F1BE0F47aF3FB8e684a06688e87A88B5151946f';
    const bscWallet = '0x3F1BE0F47aF3FB8e684a06688e87A88B5151946f';
    getTokens(tradingWallet);

    const fetchData = async () => {
      try {
        const etherscanResponse = await fetch(
          `https://api.etherscan.io/api?module=account&action=balancemulti&address=${walletAddress}&tag=latest&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`,
        );
        const etherscanData = await etherscanResponse.json();

        if (etherscanData.status === '0') {
          setFetchError(true);
          setEtherscanData([]);
        } else {
          setEtherscanData(etherscanData.result);
          setFetchError(false);

          setWeiPrice(etherscanData.result[0].balance);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError(true);
      }
    };

    if (walletAddress) {
      fetchData();
    }
  }, [moduleBalance, walletAddress]);

  if (!moduleBalance) {
    return null;
  }

  function handleChange(e: any) {
    const { target } = e;
    setWalletAddress(target.value);
    setFetchError(false);
  }

  // Etherscan returns balance in wei NOT Gwei

  function gweiToEth(wei: any) {
    const eth = wei / 1e18;
    return eth;
  }

  const ethPrice = gweiToEth(weiPrice);

  const formattedEthPrice = ethPrice.toLocaleString('fullwide', { maximumFractionDigits: 2 });

  // Assuming ethPrice is the amount in Ether and ethToUsdRate is the exchange rate
  const ethToUsdRate = 4000; // Replace with the actual exchange rate
  const usdPrice = ethPrice * ethToUsdRate;

  // Formatting the result
  const formattedUsdPrice = usdPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className={dragEnabled ? 'balance-enabled' : 'balance-disabled'}>
      <div className="balance-container">
        <div className="balance">
          <div className="balance-item">
            <h3>WALLET</h3>
            <div className="search-on">
              <input
                value={walletAddress}
                autoComplete="off"
                spellCheck="false"
                placeholder="ENTER WALLET ADDRESS"
                autoFocus
                onChange={handleChange}
              />
            </div>
            {etherscanData.length > 0 && (
              <div className="balance-rollup">
                <div className="pop-in">
                  <h1>
                    <i className="fa-brands fa-ethereum eth"></i> {formattedEthPrice} <span>ETH</span>
                  </h1>
                  <small>
                    {formattedUsdPrice} <span>USD</span>
                  </small>
                </div>
              </div>
            )}

            {!etherscanData && !fetchError && <>fetching</>}
            <div className="balance-data">
              {fetchError ? ( // Check if there was a fetch error
                <b>No account found. Please enter a valid account address.</b>
              ) : (
                etherscanData.map((item: EtherscanItem, index) => (
                  <Fragment key={index}>
                    <small>ACCOUNT</small>
                    <h3>{item.account} </h3>
                    <small>BALANCE (WEI)</small>
                    <h3>{item.balance}</h3>
                  </Fragment>
                ))
              )}
            </div>
            <div className="balance-data">
              {tokenBalances.map((token, index) => (
                <Fragment key={index}>
                  <h3 style={{ textAlign: 'left' }}>
                    {token.symbol} <small>{token.balance}</small>
                  </h3>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Balance;
