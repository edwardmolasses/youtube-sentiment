import { Rnd, RndResizeCallback, RndDragCallback } from 'react-rnd';
import { useMyContext } from '../MyContextProvider';

interface DraggableComponentProps {
  component: React.ComponentType<any>;
  x: number;
  y: number;
  w: number;
  h: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  updateContext: (
    keyX: number,
    keyY: number,
    keyW: number,
    keyH: number,
    sizingStatus: boolean,
    draggingStatus: boolean,
  ) => void;
  localStoragePrefix: string;
  dragEnabled: boolean;
  onSearch: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
  component: Component,
  localStoragePrefix,
  onSearch,
}) => {
  const { keyX, keyY, keyW, keyH, dragEnabled, sizingStatus, draggingStatus, updateContext } = useMyContext();

  const handleResize: RndResizeCallback = (e, direction, ref, delta, position) => {
    const width = ref.style.width.replace('px', '');
    const height = ref.style.height.replace('px', '');
    updateContext(Number(width), Number(height), position.x, position.y, true, false);
    localStorage.setItem(localStoragePrefix + 'W', width);
    localStorage.setItem(localStoragePrefix + 'H', height);
    localStorage.setItem(localStoragePrefix + 'X', String(position.x > 0 ? position.x : 1));
    localStorage.setItem(localStoragePrefix + 'Y', String(position.y));
  };

  const handleResizeStop = () => {
    updateContext(keyW, keyH, keyX, keyY, false, false);
  };

  const handleDragStop: RndDragCallback = (e, d) => {
    updateContext(keyW, keyH, d.x, d.y, false, false);
  };

  const handleDrag: RndDragCallback = (e, d: { x: number; y: number }) => {
    updateContext(keyW, keyH, d.x, d.y, false, true);
    localStorage.setItem(localStoragePrefix + 'X', String(d.x > 0 ? d.x : 1));
    localStorage.setItem(localStoragePrefix + 'Y', String(d.y));
  };

  const currentX = window.innerWidth / 2 - 240;
  const currentY = window.innerHeight / 2 - 60;

  return (
    <Rnd
      minHeight={minHeight || 144}
      maxHeight={maxHeight || 480}
      minWidth={minWidth || 240}
      maxWidth={maxWidth || 480}
      enableResizing={dragEnabled}
      disableDragging={!dragEnabled}
      resizeGrid={[6, 6]}
      dragGrid={[6, 6]}
      default={{
        x: Number(localStorage.getItem(localStoragePrefix + 'X')) || currentX,
        y: Number(localStorage.getItem(localStoragePrefix + 'Y')) || currentY,
        width: Number(localStorage.getItem(localStoragePrefix + 'W')) || keyW,
        height: Number(localStorage.getItem(localStoragePrefix + 'H')) || keyH,
      }}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      onDragStop={handleDragStop}
      onDrag={handleDrag}
    >
      <div className="drag">
        <Component onSearch={onSearch} />
      </div>
    </Rnd>
  );
};

export default DraggableComponent;
