import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Header from './components/Header';
import CropperPage from './pages/CropperPage';
import ConfigPage from './pages/ConfigPage'; // assuming you have this

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Add error checking
if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<CropperPage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;