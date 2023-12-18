import React, { useState, useEffect } from "react";
import { useMyContext } from "../../MyContextProvider";

interface EtherscanData {
    ethusd: string;
    ethusd_timestamp: string;
    ethbtc: string;
}

function General() {
    const dataContext = useMyContext();
    const { moduleGeneral, dragEnabled } = dataContext;
    const [etherscanData, setEtherscanData] = useState<EtherscanData>({ ethusd: "", ethusd_timestamp: "", ethbtc: "" });
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const etherscanResponse = await fetch(
                    `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
                );

                const etherscanData = await etherscanResponse.json();

                if (etherscanData.status === "0") {
                    setFetchError(true);
                    setEtherscanData({ ethusd: "", ethusd_timestamp: "", ethbtc: "" });
                } else {
                    setEtherscanData(etherscanData.result);
                    setFetchError(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setFetchError(true);
            }
        };

        if (moduleGeneral) {
            fetchData();
        }
    }, [moduleGeneral]);

    if (!moduleGeneral) {
        return null;
    }


    const convertTimestampToDateTime = (timestamp: number) => new Date(timestamp * 1000).toISOString().slice(0, 19).replace("T", " ");

    const timestamp = Number(etherscanData.ethusd_timestamp);
    const formattedDateTime = convertTimestampToDateTime(timestamp);
    
    return (
        <div className={dragEnabled ? "general-enabled" : "general-disabled"}>
            <div className="general-container">
                <div className="general">
                    <div className="general-item">
                        <h3>CURRENT ETHEREUM PRICE</h3>
                        <small>{formattedDateTime} UTC</small>
                        <div className="general-rollup">
                            {Number(etherscanData.ethusd) > 0 ? (
                                <div>
                                    <h1 className="pop-in">${Number(etherscanData.ethusd).toFixed(2)} <span>USD</span></h1>
                                    <small><span>@</span> {Number(etherscanData.ethbtc).toFixed(5)}  <span>BTC</span></small>
                                </div>
                            ) : (
                                <i className="fa-duotone fa-spinner-third spin loading"></i>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default General;
