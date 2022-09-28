import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import MainNavigation from './components/navigation/MainNavigation';
import AuthContext from './context/auth-context';

import './App.css';


const App = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const login = (token, userId, tokenExpiration) => {
    setToken(token);
    setUserId(userId)
  }

  const logout = () => {
    setToken(null);
    setUserId(null)
  }

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{token: token, userId: userId, login: login, logout: logout}}>
        <MainNavigation />
        <main className='main-content'>
          <Routes>
            { !token && <Route path='/' element={<Navigate to='/auth' replace />} /> }
            { !token && <Route path='/bookings' element={<Navigate to='/auth' replace />} /> }
            { token && <Route path='/auth' element={<Navigate to='/events' replace />} /> }
            { !token && <Route path='/auth' element={<AuthPage />} /> }
            <Route path='/events' element={<EventsPage />} />
            { token && <Route path='/bookings' element={<BookingsPage />} /> }
          </Routes>
        </main>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
