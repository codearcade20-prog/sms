import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Leaderboard from './pages/Leaderboard';
import Team from './pages/Team';
import Settings from './pages/Settings';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <Layout>
                  <Tasks />
                </Layout>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <Layout>
                  <Leaderboard />
                </Layout>
              } 
            />
            <Route 
              path="/team" 
              element={
                <Layout>
                  <Team />
                </Layout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Layout>
                  <Settings />
                </Layout>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  </ToastProvider>
  );
}

export default App;
