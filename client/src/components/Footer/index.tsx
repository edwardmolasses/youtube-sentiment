import React, { useState, MouseEvent,ReactNode } from 'react';
import { useMyContext } from '../../MyContextProvider';
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import CoinPrice from "../../components/CoinPrice";

function Footer() {
  
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    moduleGas,
    moduleCoinPrice,
    marketDataReady,
    moduleBalance,
    moduleGeneral,
    moduleDumb,
    dragEnabled,
    toggleModule,
  } = useMyContext();


  function toggleDrawer(ev: React.KeyboardEvent | React.MouseEvent) {
    if (ev.type === "keydown") {
      const _key = (ev as React.KeyboardEvent).key;
      if (_key === "Tab" || _key === "Shift") return;
    }
    setDrawerOpen((open) => !open);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
  }

  const handleModuleGas = () => {
    toggleModule('moduleGas');
    localStorage.setItem('moduleGas', String(!moduleGas));
  };

  const handleModuleGeneral = () => {
    toggleModule('moduleGeneral');
    localStorage.setItem('moduleGeneral', String(!moduleGeneral));
  };

  const handleModuleDumb = () => {
    toggleModule('moduleDumb');
    localStorage.setItem('moduleDumb', String(!moduleDumb));
  };

  const handleModuleBalance = () => {
    toggleModule('moduleBalance');
    localStorage.setItem('moduleBalance', String(!moduleBalance));
  };

  const handleDrag = () => {
    toggleModule('dragEnabled');
    localStorage.setItem('dragEnabled', String(!dragEnabled));
  };


  return (
    <>
      <div className="footer">
        <div className="footer-left">
          <button onClick={handleModuleGas} className={moduleGas ? 'on' : 'off'}>
            <i className="fas fa-gas-pump"></i>
          </button>
          {/* <button onClick={handleModuleCoinPrice} className={moduleCoinPrice ? "on" : "off"}>
          <i className="fa-regular fa-binary"></i>
        </button> */}

          {marketDataReady &&<button onClick={toggleDrawer}>MARKET PAIRS READY</button>}
          <button onClick={handleModuleBalance} className={moduleBalance ? 'on' : 'off'}>
            <i className="fa-duotone fa-wallet"></i>
          </button>
          <button onClick={handleModuleGeneral} className={moduleGeneral ? 'on' : 'off'}>
            <i className="fa-brands fa-ethereum"></i>
          </button>
          <button onClick={handleModuleDumb} className={moduleDumb ? 'on' : 'off'}>
            <i className="fa-sharp fa-regular fa-face-anguished"></i>
          </button>
        </div>
        <div className="footer-right">
         
          {dragEnabled ? 'INTERFACE IS UNLOCKED' : 'INTERFACE IS LOCKED'}{' '}
          <button onClick={handleDrag} className={dragEnabled ? 'locked' : 'unlocked'}>
            {dragEnabled ? <i className="fa-sharp fa-regular fa-lock-open"></i> : <i className="fa-sharp fa-solid fa-lock"></i>}
          </button>
        </div>
      </div>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        id="drawer"
      >
        <div role="presentation">
          <span
            id="close"
            className="fa-light fa-xmark"
            onClick={toggleDrawer}
          ></span>
          {/* {renderContent({ toggleDrawer, handleClose, drawerOpen })} */}
          <CoinPrice/>
        </div>
      </Drawer>

          <div style={{display: "none"}}><CoinPrice/></div>
          
    </>
  );
}

export default Footer;
