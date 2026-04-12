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
import CurrentlyReadingPage from './pages/CurrentlyReadingPage';
import AddCurrentlyReadingPage from './pages/AddCurrentlyReadingPage';
import FaceIdSetupPage from './pages/FaceIdSetupPage';
import RegisterPage from './pages/RegisterPage';
import InviteCodesPage from './pages/InviteCodesPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import SocialPage from './pages/SocialPage';
import FriendProfilePage from './pages/FriendProfilePage';
import FriendLibraryPage from './pages/FriendLibraryPage';
import ProfileEditPage from './pages/ProfileEditPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
            <Route path="/currently-reading" element={<CurrentlyReadingPage />} />
            <Route path="/add-currently-reading" element={<AddCurrentlyReadingPage />} />
            <Route path="/setup-face-id" element={<FaceIdSetupPage />} />
            <Route path="/invite-codes" element={<InviteCodesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/friends/:friendId" element={<FriendProfilePage />} />
            <Route path="/friends/:friendId/:listType" element={<FriendLibraryPage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
