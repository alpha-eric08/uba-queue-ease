
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link to="/admin" className="text-uba-gray hover:text-uba-red font-medium">Admin Portal</Link>
          </div>

          {/* Login/Signup Button */}
          <div className="hidden md:block">
            <Link to="/login" className="btn-outline">Login / Signup</Link>
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
              <Link to="/admin" className="text-uba-gray hover:text-uba-red font-medium py-2" onClick={toggleMenu}>Admin Portal</Link>
              <Link to="/login" className="btn-primary text-center" onClick={toggleMenu}>Login / Signup</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
