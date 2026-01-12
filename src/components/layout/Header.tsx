import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-[#e7dfda]">
      <header className="flex items-center justify-between whitespace-nowrap px-4 py-3 max-w-[1280px] mx-auto md:px-10">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
            <Icon name="temple_hindu" className="text-3xl" />
            <h2 className="text-[#181410] text-xl font-bold tracking-tight">Shravan Kumar</h2>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-[#181410] text-sm font-medium hover:text-primary transition-colors" to="/circuits">
              Sacred Circuits
            </Link>
            <Link className="text-[#181410] text-sm font-medium hover:text-primary transition-colors" to="/safety-vows">
              Safety Vows
            </Link>
            <a className="text-[#181410] text-sm font-medium hover:text-primary transition-colors" href="#story">
              Our Story
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-[#181410]">
                  {user.email?.split('@')[0]}
                </span>
                <Icon name="expand_more" className="text-[#181410]" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#e7dfda] py-2 z-20">
                    <div className="px-4 py-2 border-b border-[#e7dfda]">
                      <p className="text-sm font-medium text-[#181410]">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#181410] hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon name="dashboard" className="text-[18px]" />
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/messages');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#181410] hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon name="chat" className="text-[18px]" />
                      Messages
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon name="logout" className="text-[18px]" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden md:flex text-[#181410] text-sm font-medium hover:text-primary"
            >
              Login
            </button>
          )}
          <Button variant="primary" size="md" onClick={() => navigate('/circuits')}>
            <span>Plan a Journey</span>
          </Button>
        </div>
      </header>
    </div>
  );
};
