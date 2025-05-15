import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
// // tive que mudar o main depois de criar o sistema de logins pois Uso do React Router DOM
// Como você está usando <Link> do react-router-dom, seu projeto precisa estar configurado com o BrowserRouter para que as rotas funcionem.
