
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-uba-red font-bold text-2xl">UBA</span>
            <span className="hidden md:inline text-uba-gray font-medium">QueueEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" className="text-uba-gray hover:text-uba-red font-medium">Home</Link>
            <Link to="/join-queue" className="text-uba-gray hover:text-uba-red font-medium">Join Queue</Link>
            <Link to="/track-queue" className="text-uba-gray hover:text-uba-red font-medium">Track Queue</Link>
            {user && (
              <Link to="/admin" className="text-uba-gray hover:text-uba-red font-medium">Admin Portal</Link>
            )}
          </div>

          {/* Login/Signup Button or Admin Button */}
          <div className="hidden md:block">
            {user ? (
              <Link to="/admin" className="btn-outline">Admin Dashboard</Link>
            ) : (
              <Link to="/login" className="btn-outline">Admin Login</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-uba-gray p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-uba-gray hover:text-uba-red font-medium py-2" onClick={toggleMenu}>Home</Link>
              <Link to="/join-queue" className="text-uba-gray hover:text-uba-red font-medium py-2" onClick={toggleMenu}>Join Queue</Link>
              <Link to="/track-queue" className="text-uba-gray hover:text-uba-red font-medium py-2" onClick={toggleMenu}>Track Queue</Link>
              {user && (
                <Link to="/admin" className="text-uba-gray hover:text-uba-red font-medium py-2" onClick={toggleMenu}>Admin Portal</Link>
              )}
              {user ? (
                <Link to="/admin" className="btn-primary text-center" onClick={toggleMenu}>Admin Dashboard</Link>
              ) : (
                <Link to="/login" className="btn-primary text-center" onClick={toggleMenu}>Admin Login</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
