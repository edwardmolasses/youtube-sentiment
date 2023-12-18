import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useMyContext } from '../../MyContextProvider';
import { ethers } from 'ethers';
import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import tokenList from '@uniswap/default-token-list/build/uniswap-default.tokenlist.json';

type TransactionDetails = {
  hash: string;
  token: string;
  transferType: string;
  amount: string;
  date: string;
};

type Transaction = {
  blockHash: string | null;
  blockNumber: string | null;
  chainId: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  r: string;
  s: string;
  to: string;
  transactionIndex: string | null;
  type: string;
  v: string;
  value: string;
};

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

function getCurrentDateTime(): string {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = (((hours + 11) % 12) + 1).toString(); // Convert 24-hour format to 12-hour format
  return `${day}/${month} ${formattedHours}:${minutes}${ampm}`;
}

function getIsEtherTransfer(transaction: Transaction): boolean {
  return ethers.utils.hexZeroPad(transaction.input, 32) === '0x';
}

function truncateNumber(num: number): number {
  return Math.floor(num * 100000) / 100000;
}

function formatAddress(address: string): string {
  const prefix = address.substring(0, 5);
  const suffix = address.substring(address.length - 3);
  return `${prefix}...${suffix}`;
}

function getEtherTransferDetails(transaction: Transaction, walletAddress: string): TransactionDetails | undefined {
  const isEtherTransfer: boolean = transaction.input === '0x';
  const txnDetails: TransactionDetails = {
    hash: transaction.hash,
    token: '',
    transferType: '',
    amount: '',
    date: getCurrentDateTime(),
  };

  if (isEtherTransfer) {
    const value = ethers.utils.formatEther(transaction.value);
    txnDetails.token = 'ETH';
    txnDetails.amount = value;
  } else {
    const decodedInput = ethers.utils.defaultAbiCoder.decode(['address', 'uint256'], transaction.input.slice(10));
    const [recipient, amount] = decodedInput;
    txnDetails.token = transaction.to;
    txnDetails.amount = amount.toString();
  }

  if (transaction.from.toLowerCase() === walletAddress.toLowerCase()) {
    txnDetails.transferType = 'sent';
  } else if (transaction.to.toLowerCase() === walletAddress.toLowerCase()) {
    txnDetails.transferType = 'received';
  } else {
    console.log('Unrelated Ether transfer.');
    return undefined;
  }

  return txnDetails;
}

function Dumb() {
  const dataContext = useMyContext();
  const { moduleDumb, dragEnabled } = dataContext;
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [isWebSocketConnected, setWebSocketConnected] = useState(false); // Add state for WebSocket connection
  const rollbitWallet = '0xCBD6832Ebc203e49E2B771897067fce3c58575ac';
  const cryptodotcomeWallet = '0x46340b20830761efd32832A74d7169B29FEB9758';
  const coinbasedepositWallet = '0x7830c87C02e56AFf27FA8Ab1241711331FA86F43';
  const coinbase13Wallet = '0x7830c87C02e56AFf27FA8Ab1241711331FA86F43';
  const hitbtcWallet = '0x0113a6b755fBaD36B4249Fd63002e2035E401143';
  const testWallet = '0xb5d85CBf7cB3EE0D56b3bB207D5Fc4B82f43F511';
  const isWebSocketSetup = useRef(false);
  const [walletAddress, setWalletAddress] = useState(testWallet);
  const prevWalletAddress = useRef(walletAddress);

  const setupWebSocket = async () => {
    // close the existing WebSocket connection
    alchemy.ws.removeAllListeners();

    // open a new WebSocket connection with the new wallet address
    const listener = alchemy.ws.on(
      {
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        fromAddress: walletAddress,
        toAddress: walletAddress,
      },
      (tx) => {
        // TODO: support non ETH token transfers
        getIsEtherTransfer(tx) ? console.log('Ether Transfer: ', tx.hash) : console.log('Token Transfer: ', tx.hash);
        console.log(getEtherTransferDetails(tx, walletAddress));
        const txnDetails = getEtherTransferDetails(tx, walletAddress);
        if (txnDetails !== undefined) {
          setTransactionDetails(txnDetails);
          setTransactions((prevTransactions) => {
            if (prevTransactions.length === 6) {
              prevTransactions.shift();
            }
            return [...prevTransactions, txnDetails];
          });
        } else {
          setTransactionDetails(null);
        }
      },
    );
  };

  useEffect(() => {
    const getTokenBalances = async () => {
      alchemy.core.getTokenBalances(walletAddress).then(console.log);
    };

    if (
      ((moduleDumb && !isWebSocketSetup.current) || prevWalletAddress.current !== walletAddress) &&
      ethers.utils.isAddress(walletAddress)
    ) {
      console.log('setupWebSocket...');
      setupWebSocket();
      isWebSocketSetup.current = true;
    }

    // update the previous walletAddress after every render
    prevWalletAddress.current = walletAddress;

    return () => {
      if (isWebSocketSetup.current) {
        alchemy.ws.removeAllListeners();
      }
    };
  }, [walletAddress]);

  function handleChange(e: any) {
    const { target } = e;
    const newAddress = target.value;
    console.log('newAddress', newAddress);
    if (ethers.utils.isAddress(newAddress)) {
      setTransactions([]);
      setWalletAddress(newAddress);
    }
  }

  if (!moduleDumb) {
    return null;
  }

  return (
    <div className={dragEnabled ? 'transaction-enabled' : 'transaction-disabled'}>
      <div className="transaction-container">
        <div className="transaction">
          <div className="transaction-item">
            <label>WALLET ADDRESS</label>
            <div className="search-on">
              <input
                defaultValue={walletAddress}
                autoComplete="off"
                spellCheck="false"
                placeholder="ENTER WALLET ADDRESS"
                autoFocus
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="transaction-item">
            {transactions[transactions.length - 1]?.hash &&
            transactions[transactions.length - 1]?.amount &&
            transactions[transactions.length - 1]?.token ? (
              <>
                <label>LATEST TRANSACTION</label>
                <div className="transaction-data">
                  <div>
                    [ {formatAddress(transactions[transactions.length - 1].hash)} ]
                    <br />
                    <small>
                      {transactions[transactions.length - 1]?.date ? ` @ ${transactions[transactions.length - 1]?.date}` : ``}
                    </small>
                  </div>

                  <h3>
                    {` ${truncateNumber(parseFloat(transactions[transactions.length - 1].amount))} ${
                      transactions[transactions.length - 1].token
                    }`}
                  </h3>

                  <div style={{ textAlign: 'right' }}>
                    <b>{transactions[transactions.length - 1].transferType}</b>
                  </div>
                </div>
              </>
            ) : (
              <small><span className="pulse-slow">WATCHING FOR TRANSACTIONS</span><br/>ADDRESS <i className="fa-sharp fa-light fa-arrow-right-long"></i>{walletAddress}</small>
            )}
          </div>
        </div>
        {transactions.length > 0 && (
          <div className="transaction-item">
            {transactions.length > 1 ? <label>OLDER TRANSACTIONS</label> : null}
            <div className="transaction-data-compact">
              {transactions
                .slice(0, -1)
                .reverse()
                .map((transaction, index) => (
                  <Fragment key={index}>
                    <div>
                      [ {formatAddress(transaction.hash)} ]
                      <br />
                      <small>{` @ ${transaction.date}`}</small>
                    </div>

                    <h3>{`${truncateNumber(parseFloat(transaction.amount))} ${transaction.token}`}</h3>

                    <div style={{ textAlign: 'right' }}>
                      <b>{transaction.transferType}</b>
                    </div>
                  </Fragment>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dumb;
