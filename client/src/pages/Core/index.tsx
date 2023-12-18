import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../MyContextProvider';
import Gas from '../../components/Gas';
import Balance from '../../components/Balance';
import Dumb from '../../components/Dumb';
import General from '../../components/General';
import DraggableComponent from '../../components/DraggableComponent';
import Footer from '../../components/Footer';

const Core: React.FC = () => {
  const {
    dragEnabled,
    moduleGas,
    moduleBalance,
    moduleCoinPrice,
    moduleGeneral,
    moduleDumb,
    updateContext,
  } = useMyContext();

  function useLocalState(key: string, initialValue: number) {
    const [value, setValue] = useState<number>(() => {
      const storedValue = localStorage.getItem(key);
      return storedValue ? parseInt(storedValue, 10) : initialValue;
    });

    useEffect(() => {
      localStorage.setItem(key, value.toString());
    }, [key, value]);

    return [value, setValue] as const;
  }

  // Usage:

  const [localDumbX] = useLocalState('localDumbX', 0);
  const [localDumbY] = useLocalState('localDumbY', 0);
  const [localDumbW] = useLocalState('localDumbW', 0);
  const [localDumbH] = useLocalState('localDumbH', 0);

  const dumbCurrentX = (window.innerWidth / 2) - 240;
  const dumbCurrentY = (window.innerHeight / 2) - 60;

  const [localGeneralX] = useLocalState('localGeneralX', 0);
  const [localGeneralY] = useLocalState('localGeneralY', 0);
  const [localGeneralW] = useLocalState('localGeneralW', 0);
  const [localGeneralH] = useLocalState('localGeneralH', 0);

  const generalCurrentX = (window.innerWidth / 2) - 240;
  const generalCurrentY = (window.innerHeight / 2) - 60;

  const [localBalanceX] = useLocalState('localBalanceX', 0);
  const [localBalanceY] = useLocalState('localBalanceY', 0);
  const [localBalanceW] = useLocalState('localBalanceW', 0);
  const [localBalanceH] = useLocalState('localBalanceH', 0);

  const balanceCurrentX = (window.innerWidth / 2) - 240;
  const balanceCurrentY = (window.innerHeight / 2) - 60;

  const [localGasX] = useLocalState('localGasX', 0);
  const [localGasY] = useLocalState('localGasY', 0);
  const [localGasW] = useLocalState('localGasW', 0);
  const [localGasH] = useLocalState('localGasH', 0);

  const gasCurrentX = (window.innerWidth / 2) - 240;
  const gasCurrentY = (window.innerHeight / 2) - 60;

  return (
    <div>
      {moduleGeneral &&
        <DraggableComponent
          component={General}
          x={localGeneralX ? localGeneralX : generalCurrentX}
          y={localGeneralY ? localGeneralY : generalCurrentY}
          w={localGeneralW}
          h={localGeneralH}
          minHeight={240}
          maxHeight={480}
          minWidth={480}
          maxWidth={600}
          updateContext={updateContext}
          localStoragePrefix="localGeneral"
          dragEnabled={dragEnabled}
          onSearch={() => { }}
        />
      }

      {moduleBalance &&
        <DraggableComponent
          component={Balance}
          x={localBalanceX ? localBalanceX : balanceCurrentX}
          y={localBalanceY ? localBalanceY : balanceCurrentY}
          w={localBalanceW}
          h={localBalanceH}
          minHeight={240}
          maxHeight={600}
          minWidth={240}
          maxWidth={600}
          updateContext={updateContext}
          localStoragePrefix="localBalance"
          dragEnabled={dragEnabled}
          onSearch={() => { }}
        />
      }
    
      {moduleGas &&
        <DraggableComponent
          component={Gas}
          x={localGasX ? localGasX : gasCurrentX}
          y={localGasY ? localGasY : gasCurrentY}
          w={localGasW}
          h={localGasH}
          minHeight={360}
          maxHeight={600}
          minWidth={240}
          maxWidth={600}
          updateContext={updateContext}
          localStoragePrefix="localGas"
          dragEnabled={dragEnabled}
          onSearch={() => { }}
        />
      }
      {moduleDumb &&
        <DraggableComponent
          component={Dumb}
          x={localDumbX ? localDumbX : dumbCurrentX}
          y={localDumbY ? localDumbY : dumbCurrentY}
          w={localDumbW}
          h={localDumbH}
          minHeight={480}
          maxHeight={600}
          minWidth={480}
          maxWidth={600}
          updateContext={updateContext}
          localStoragePrefix="localDumb"
          dragEnabled={dragEnabled}
          onSearch={() => { }}
        />
      }

      <Footer />
    </div>
  );
};

export default Core;