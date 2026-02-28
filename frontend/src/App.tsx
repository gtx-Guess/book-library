import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AddBookPage from './pages/AddBookPage';
import LibraryPage from './pages/LibraryPage';
import GoalSettingsPage from './pages/GoalSettingsPage';
import GoalDetailsPage from './pages/GoalDetailsPage';
import HistoryPage from './pages/HistoryPage';
import YearDetailsPage from './pages/YearDetailsPage';
import DNFPage from './pages/DNFPage';
import AddDNFPage from './pages/AddDNFPage';
import WantToReadPage from './pages/WantToReadPage';
import AddWantToReadPage from './pages/AddWantToReadPage';
import FaceIdSetupPage from './pages/FaceIdSetupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddBookPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/year/:year" element={<YearDetailsPage />} />
            <Route path="/library/:year" element={<LibraryPage />} />
            <Route path="/goal/:year" element={<GoalDetailsPage />} />
            <Route path="/goal/:year/edit" element={<GoalSettingsPage />} />
            <Route path="/dnf" element={<DNFPage />} />
            <Route path="/add-dnf" element={<AddDNFPage />} />
            <Route path="/want-to-read" element={<WantToReadPage />} />
            <Route path="/add-want-to-read" element={<AddWantToReadPage />} />
            <Route path="/setup-face-id" element={<FaceIdSetupPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
