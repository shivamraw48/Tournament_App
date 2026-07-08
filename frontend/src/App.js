import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './HomePage';
import BookingDetails from './BookingDetails';
import MainLayout from './components/MainLayout';
import TournamentSlotSelection from './TournamentSlotSelection';

import Register from './Register';
import AboutUs from './AboutUs';
import Login from './Login';

import TournamentList from './TournamentList';
import TournamentDetail from './TournamentDetail';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<MainLayout />}>
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/tournaments/:id/select-slot" element={<TournamentSlotSelection />} />
            <Route path="/tournaments/:id/book-details" element={<BookingDetails />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<AboutUs />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboard />} />
            </Route>
          </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;