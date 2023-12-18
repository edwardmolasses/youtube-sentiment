import { useState, useEffect, useMemo } from "react";
import { useMyContext } from "../../MyContextProvider";
import { providers, BigNumber } from "ethers";

import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine
} from "react-sparklines";

async function getGasPrice(provider: providers.JsonRpcProvider): Promise<string> {
  const gasPrice = await provider.getGasPrice();
  return gasPrice.toString();
}

function convertToGwei(weiValue: string | number): string {
  const weiValueBigNumber = BigNumber.from(weiValue);
  const gweiValue = weiValueBigNumber.div(BigNumber.from(10).pow(9));
  return gweiValue.toString();
}

function Gas() {
  const [gasPrices, setGasPrices] = useState<string[]>([]);
  const [recommendedGasPrice, setRecommendedGasPrice] = useState<string[]>([]);

  const dataContext = useMyContext();
  const { moduleGas, dragEnabled, sizingStatus, draggingStatus } = dataContext;
  const ALCHEMY_RPC_URL: string = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}` || "";
  const alchemyProvider = useMemo(() => new providers.JsonRpcProvider(ALCHEMY_RPC_URL), [ALCHEMY_RPC_URL]);

    // get recommended fee
    async function fetchPrice() {
      if (!sizingStatus && !draggingStatus) { // Check if resizing is not in progress

        const priceInWei = await getGasPrice(alchemyProvider);
        const priceInGwei = convertToGwei(priceInWei);

        setGasPrices((prevGasPrices) => [...prevGasPrices, priceInGwei.toString()]);

        const feeData = await alchemyProvider.getFeeData();
        // console.log("Gas Price");

        if (feeData === null || feeData.maxPriorityFeePerGas === null || feeData.maxFeePerGas === null) {
          throw new Error("Failed to fetch fee data");
        }

        const maxFeePerGasInGwei = convertToGwei(feeData.maxFeePerGas.toString());

        setRecommendedGasPrice(prevPrices => [...prevPrices, maxFeePerGasInGwei]);
      }
    }


  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    fetchPrice();

    intervalId = setInterval(() => {
      fetchPrice();
    }, 24000);

    return () => clearInterval(intervalId);
  }, []); 


  const gweiPrice = recommendedGasPrice[recommendedGasPrice.length - 1]
  const ethPrice = gweiToEth(gweiPrice);

  function gweiToEth(gwei: any) {
    const eth = gwei / 1e9;
    return eth;
  }


  const formattedEthPrice = ethPrice.toLocaleString('fullwide', { maximumFractionDigits: 8 });

  if (!moduleGas) {
    return null;
  }

  return (
    // <div className="gas-init">
    // <div className="drag-note"></div>
    <div className={dragEnabled ? "gas-enabled" : "gas-disabled"}>
      <div className="gas-container">

        <div className="gas">
          <div className="gas-item">
            <h3>RECOMMENDED GAS PRICE</h3>
            <div className="gas-rollup">
              {gasPrices.length > 0 ? (
                <div>
                  <h1 className="pop-in">{recommendedGasPrice[recommendedGasPrice.length - 1]} Gwei</h1>
                  <small>{formattedEthPrice} <i className="fa-brands fa-ethereum eth"></i></small>
                </div>
              ) : (
                <i className="fa-duotone fa-spinner-third spin loading"></i>
              )}
            </div>
            <div className="gas-meta-stacked">
              <div className="gas-chain">
                <label>
                  CHAIN
                </label>
                <h6>
                  <i className="fa-brands fa-ethereum eth"></i> ETHEREUM
                </h6>
              </div>
              <div className="gas-rec">
                <label>
                  BASE
                </label>
                <h6>
                  {gasPrices[gasPrices.length - 1]} Gwei
                </h6>
              </div>
              <div className="gas-chart">
                <Sparklines
                  data={
                    gasPrices.length < 20
                      ? gasPrices.map(Number)
                      : gasPrices.slice(Math.max(gasPrices.length - 20, 1)).map(Number)
                  }
                >
                  <SparklinesLine
                    style={{
                      strokeWidth: 4,
                      stroke: "#50b8e7",
                      fill: "none"
                    }}
                  />
                  <SparklinesReferenceLine
                    type="mean"
                    style={{
                      stroke: "#50b8e7",
                      strokeOpacity: .72,
                      strokeWidth: 2,
                      strokeDasharray: "3, 1",
                    }}
                  />
                </Sparklines>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
}

export default Gas;
