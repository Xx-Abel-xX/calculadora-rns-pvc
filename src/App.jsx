import { useState } from 'react';
import Cotizador from './pages/Cotizador.jsx';
import Inventario from './pages/Inventario.jsx';

export default function App() {
  const [tab, setTab] = useState('cotizador');

  return (
    <>
      <header className="header">
        <div className="header__brand">
          <span className="header__logo">RNS</span>
          <span className="header__name">Cotizador PVC</span>
        </div>
        <nav className="tabs">
          <button
            className={`tab ${tab === 'cotizador' ? 'tab--active' : ''}`}
            onClick={() => setTab('cotizador')}
          >
            Cotizador
          </button>
          <button
            className={`tab ${tab === 'inventario' ? 'tab--active' : ''}`}
            onClick={() => setTab('inventario')}
          >
            Inventario
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'cotizador' ? <Cotizador /> : <Inventario />}
      </main>

      <footer className="footer">
        <p>Cantidades y precios referenciales.</p>
      </footer>
    </>
  );
}
