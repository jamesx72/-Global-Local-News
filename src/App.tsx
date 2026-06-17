import { useState } from 'react';
import Layout from './components/Layout';
import Home from './views/Home';
import Contributor from './views/Contributor';
import Wallet from './views/Wallet';
import Verification from './views/Verification';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home />;
      case 'contributor': return <Contributor />;
      case 'wallet': return <Wallet />;
      case 'verification': return <Verification />;
      default: return <Home />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}
