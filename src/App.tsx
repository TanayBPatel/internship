import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import AdminDashboard from './pages/AdminDashboard';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import UserDashboard from './pages/UserDashBoard';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostPage />} />
          
          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <SignedIn>
                <AdminDashboard />
              </SignedIn>
            }
          />
          
          <Route
            path="/admin/create"
            element={
              <SignedIn>
                <CreatePost />
              </SignedIn>
            }
          />
          <Route
            path="/admin/edit/:slug"
            element={
              <SignedIn>
                <EditPost />
              </SignedIn>
            }
          />
          <Route
            path="/user"
            element={
              <SignedIn>
                <UserDashboard />
              </SignedIn>
            }
          />
        </Routes>

        
        
        <SignedOut>
          <Routes>
            <Route path="/admin*" element={<RedirectToSignIn />} />
          </Routes>
        </SignedOut>
      </div>
    </Router>
  );
}

export default App;