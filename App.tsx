
import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './contexts';
import LoginPage from './components/pages/LoginPage';
import SpacesPage from './components/pages/SpacesPage';
import SpaceDetailPage from './components/pages/SpaceDetailPage';
import ProfilePage from './components/pages/ProfilePage';
import { Spinner } from './components/ui';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/spaces" element={<SpacesPage />} />
              <Route path="/spaces/:id" element={<SpaceDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<Navigate to="/spaces" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;