import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import { PenTool, Home, User, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
console.log("User:", ( user?.publicMetadata?.role=="admin"));
  const isActive = (path: string) => {
    return location.pathname === path;
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

            {(isSignedIn && user?.publicMetadata?.role=="admin") ? (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
                
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                
                  <SignOutButton>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </SignOutButton>
                </div>
              </>
            ): null}
            {(isSignedIn&& user?.publicMetadata?.role!="admin") ? (
              <>
                <Link
                  to="/user"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/user') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>User</span>
                </Link>
                
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                  
                  <SignOutButton>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </SignOutButton>
                </div>
              </>
            ) :null}
             {(!isSignedIn) ? (
              <SignInButton mode="modal">
                <button className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            ):null}        
              </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;