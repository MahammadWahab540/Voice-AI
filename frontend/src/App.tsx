import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthScreen } from './screens/AuthScreen';
import { MainScreen } from './screens/MainScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/call" element={<MainScreen />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
