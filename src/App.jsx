import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { UserProvider } from './lib/UserContext';
import { GameProvider } from './lib/GameContext';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import JoinGamePage from './pages/JoinGamePage';

// Replace with your actual Privy App ID
const PRIVY_APP_ID = "cmbvrtjbi00mpib0neu8517hj";

function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#3B82F6', // Tailwind blue-500
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
      }}
    >
      <UserProvider>
        <GameProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/game/:gameId" element={<JoinGamePage />} />
              <Route path="/join/:gameId" element={<JoinGamePage />} />
              <Route path="/join" element={<JoinGamePage />} />
              <Route path="/play" element={<GamePage />} />
              <Route path="/result" element={<ResultPage />} />
            </Routes>
          </Router>
        </GameProvider>
      </UserProvider>
    </PrivyProvider>
  );
}

export default App; 