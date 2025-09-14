import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import Header from './components/Header';
import CropperPage from './pages/CropperPage';
import ConfigPage from './pages/ConfigPage'; 

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file");
}

// Create a separate component that uses useAuth inside ClerkProvider
function AppContent() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  
  console.log('Auth Status:', { isLoaded, userId, isSignedIn });
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<CropperPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;