import React, { useEffect, createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface DefaultContextData {
  moduleGas: boolean;
  moduleBalance: boolean;
  moduleCoinPrice: boolean;
  marketDataReady: boolean;
  moduleGeneral: boolean;
  moduleDumb: boolean;
  dragEnabled: boolean;
  keyX: number;
  keyY: number;
  keyW: number;
  keyH: number;
  sizingStatus: boolean;
  draggingStatus: boolean;
  updateContext: (
    keyX: number,
    keyY: number,
    keyW: number,
    keyH: number,
    sizingStatus: boolean,
    draggingStatus: boolean,
  ) => void;
  updateFooterContext: (moduleGas: boolean, moduleCoinPrice: boolean, marketDataReady: boolean, moduleBalance: boolean, moduleGeneral:boolean,moduleDumb:boolean, dragEnabled: boolean) => void;
  toggleModule: (moduleName: keyof DefaultContextData) => void;
}

const MyContext = createContext<DefaultContextData>({
  moduleGas: false,
  moduleBalance: false,
  moduleCoinPrice: true,
  marketDataReady: false,
  moduleGeneral: false,
  moduleDumb: false,
  dragEnabled: false,
  keyX: 0,
  keyY: 0,
  keyW: 0,
  keyH: 0,
  sizingStatus: false,
  draggingStatus: false,
  updateContext: () => {},
  updateFooterContext: () => {},
  toggleModule: () => {},
});

interface MyContextProviderProps {
  children: ReactNode;
}

export const MyContextProvider: React.FC<MyContextProviderProps> = ({ children }) => {
  const [dragEnabled, setDragEnabled] = useState(() => getLocalStorageBoolean("dragEnabled", false));
  const [moduleGas, setModuleGas] = useState(() => getLocalStorageBoolean("moduleGas", false));
  const [moduleBalance, setModuleBalance] = useState(() => getLocalStorageBoolean("moduleBalance", false));
  const [moduleCoinPrice, setModuleCoinPrice] = useState(() => getLocalStorageBoolean("moduleCoinPrice", true));
  const [marketDataReady, setMarketDataReady] = useState(() => getLocalStorageBoolean("marketDataReady", false));
  const [moduleGeneral, setModuleGeneral] = useState(() => getLocalStorageBoolean("moduleGeneral", false));
  const [moduleDumb, setModuleDumb] = useState(() => getLocalStorageBoolean("moduleDumb", false));
  const [keyX, setKeyX] = useState(0);
  const [keyY, setKeyY] = useState(0);
  const [keyW, setKeyW] = useState(480);
  const [keyH, setKeyH] = useState(120);
  const [sizingStatus, setSizingStatus] = useState(false);
  const [draggingStatus, setDraggingStatus] = useState(false);


  const updateContext = useCallback(
    (
      keyX: number,
      keyY: number,
      keyW: number,
      keyH: number,
      sizingStatus: boolean,
      draggingStatus: boolean,
    ) => {
      setKeyX(keyX);
      setKeyY(keyY);
      setKeyW(keyW);
      setKeyH(keyH);
      setDraggingStatus(draggingStatus);
      setSizingStatus(sizingStatus);
    },
    []
  );

  const updateFooterContext = useCallback(
    (moduleGas: boolean, moduleCoinPrice: boolean, marketDataReady: boolean, moduleBalance: boolean, moduleGeneral: boolean, moduleDumb: boolean,dragEnabled: boolean) => {
      setModuleGas(moduleGas);
      setModuleBalance(moduleBalance);
      setModuleCoinPrice(moduleCoinPrice);
      setMarketDataReady(marketDataReady);
      setModuleGeneral(moduleGeneral);
      setModuleDumb(moduleDumb);
      setDragEnabled(dragEnabled);
    },
    []
  );



  const toggleModule = useCallback(
    (moduleName: keyof DefaultContextData) => {
      updateFooterContext(
        moduleName === 'moduleGas' ? !moduleGas : moduleGas, 
        moduleName === 'moduleCoinPrice' ? !moduleCoinPrice : moduleCoinPrice,
        moduleName === 'marketDataReady' ? !marketDataReady : marketDataReady,
        moduleName === 'moduleBalance' ? !moduleBalance : moduleBalance,
        moduleName === 'moduleGeneral' ? !moduleGeneral : moduleGeneral,
        moduleName === 'moduleDumb' ? !moduleDumb : moduleDumb,
        moduleName === 'dragEnabled' ? !dragEnabled : dragEnabled);
    },
    [moduleGas, moduleCoinPrice, moduleBalance, moduleGeneral, moduleDumb, dragEnabled, updateFooterContext]
  );

  const contextValues: DefaultContextData = {
    keyX,
    keyY,
    keyW,
    keyH,
    dragEnabled,
    moduleGas,
    moduleBalance,
    moduleGeneral,
    moduleDumb,
    moduleCoinPrice,
    marketDataReady,
    sizingStatus,
    draggingStatus,
    updateContext,
    updateFooterContext,
    toggleModule,
  };

  return <MyContext.Provider value={contextValues}>{children}</MyContext.Provider>;
};


export const useMyContext = () => {
  
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  
  return context;
};

function getLocalStorageBoolean(key: string, defaultValue: boolean): boolean {
  const storedValue = localStorage.getItem(key);
  return storedValue === 'true' || storedValue === 'false' ? storedValue === 'true' : defaultValue;
}
