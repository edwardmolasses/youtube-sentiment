import { useMyContext } from '../../MyContextProvider';

function Footer() {
  

  const {
    moduleGeneral,
    dragEnabled,
    toggleModule,
  } = useMyContext();




  const handleModuleGeneral = () => {
    toggleModule('moduleGeneral');
    localStorage.setItem('moduleGeneral', String(!moduleGeneral));
  };

  const handleDrag = () => {
    toggleModule('dragEnabled');
    localStorage.setItem('dragEnabled', String(!dragEnabled));
  };


  return (
    <>
      <div className="footer">
        <div className="footer-left">
          <button onClick={handleModuleGeneral} className={moduleGeneral ? 'on' : 'off'}>
          <i className="fa-light fa-microchip-ai"></i>
          </button>
        </div>
        <div className="footer-right">
         
          {dragEnabled ? 'INTERFACE IS UNLOCKED' : 'INTERFACE IS LOCKED'}{' '}
          <button onClick={handleDrag} className={dragEnabled ? 'locked' : 'unlocked'}>
            {dragEnabled ? <i className="fa-sharp fa-light fa-lock-open"></i> : <i className="fa-sharp fa-light fa-lock"></i>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Footer;
