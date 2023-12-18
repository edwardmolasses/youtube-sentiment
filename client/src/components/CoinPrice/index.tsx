import { useState, useEffect } from "react";
import { useMyContext } from "../../MyContextProvider";
import { providers } from "ethers";
import { FACTORY_ADDRESSES, UNISWAP_LOOKUP_CONTRACT_ADDRESS_MAINNET } from "../../utils/addresses";
import { UniswappyV2EthPair } from "../../utils/UniswappyV2EthPair";
import { convertPoolsToPrices } from "../../utils/utils";

function CoinPrice() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<marketDataItem[]>([]); // Explicitly specify the type
    const [coinPrice] = useState<string | null>(null);
    const dataContext = useMyContext();
    const { dragEnabled, moduleCoinPrice, marketDataReady, toggleModule } = dataContext;
    const ALCHEMY_RPC_URL: string = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}` || "";

    type marketDataItem = {
        symbol: string;
        priceInUsdc: number;
    };

    useEffect(() => {
        async function fetchMarkets() {
            try {
                const alchemyProvider = new providers.JsonRpcProvider(ALCHEMY_RPC_URL);
                const markets = await UniswappyV2EthPair.getUniswapMarketsByToken(
                    alchemyProvider,
                    FACTORY_ADDRESSES,
                    UNISWAP_LOOKUP_CONTRACT_ADDRESS_MAINNET
                );
                const marketData = JSON.stringify(markets.allMarketPairs);
                localStorage.setItem('marketData', marketData);
                toggleModule("marketDataReady");
                const processedLPs = convertPoolsToPrices(markets.allMarketPairs);
                setIsLoading(false);
                console.log("processedLPs", processedLPs);
                setData(processedLPs);

            } catch (error) {
                console.error('Error fetching markets:', error);
            }
        }

        console.log("loading market pairs in background");

        fetchMarkets();
    }, [moduleCoinPrice]);

    if (!moduleCoinPrice) {
        return null;
    }

    return (
        <div className={dragEnabled ? "drag-enabled" : "drag-disabled"}>
            <div className="drag-container">
                <div className="gas-item">
                    <div className="gas-data">
                        {data && data.map((item: marketDataItem, index) => (
                            <div key={index}>
                                <small>SYMBOL: {item.symbol}</small>
                                <small>PRICE USDC: {item.priceInUsdc}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoinPrice;
