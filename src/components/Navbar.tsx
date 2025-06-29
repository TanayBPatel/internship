import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SignInButton, useClerk, useUser } from '@clerk/clerk-react';
import { PenTool, Home, User, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isActiveStartsWith = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home page after successful sign out
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to home page
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <PenTool className="h-8 w-8 text-blue-600" />
              <span>BlogHub</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {/* Admin Navigation */}
            {isSignedIn && user?.publicMetadata?.role === "admin" && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
                
                <Link
                  to="/create"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/create') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  <span>Create Post</span>
                </Link>
              </>
            )}

            {/* User Navigation */}
            {isSignedIn && user?.publicMetadata?.role !== "admin" && (
              <>
                <Link
                  to="/user"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/user') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/create"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/create') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  <span>Create Post</span>
                </Link>
              </>
            )}

            {/* User Profile and Sign Out */}
            {isSignedIn && (
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                  {user?.publicMetadata?.role === "admin" && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Sign In Button */}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;