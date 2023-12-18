import React from 'react';
import { MyContextProvider } from './MyContextProvider';
import Core from "./pages/Core";
import "./styles/index.scss";



// Wrap your application with the context provider
const App: React.FC = () => {
  return (
    <MyContextProvider>
      <Core />
    </MyContextProvider>
  );
};

export default App;
