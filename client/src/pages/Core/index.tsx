import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../MyContextProvider';
import General from '../../components/General';
import DraggableComponent from '../../components/DraggableComponent';
import Footer from '../../components/Footer';

const Core: React.FC = () => {
  const {
    dragEnabled,
    moduleGeneral,
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

  const [localGeneralX] = useLocalState('localGeneralX', 0);
  const [localGeneralY] = useLocalState('localGeneralY', 0);
  const [localGeneralW] = useLocalState('localGeneralW', 0);
  const [localGeneralH] = useLocalState('localGeneralH', 0);

  const generalCurrentX = (window.innerWidth / 2) - 240;
  const generalCurrentY = (window.innerHeight / 2) - 60;

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
          maxHeight={600}
          minWidth={240}
          maxWidth={600}
          updateContext={updateContext}
          localStoragePrefix="localGeneral"
          dragEnabled={dragEnabled}
          onSearch={() => { }}
        />
      }

      <Footer />
    </div>
  );
};

export default Core;