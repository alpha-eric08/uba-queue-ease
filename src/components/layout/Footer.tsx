
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-uba-gray text-white pt-12 pb-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>customerservice@ubagroup.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>UBA House, 57 Marina, Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/" className="hover:text-uba-red transition-colors">Home</Link>
              <Link to="/join-queue" className="hover:text-uba-red transition-colors">Join Queue</Link>
              <Link to="/track-queue" className="hover:text-uba-red transition-colors">Track Queue</Link>
              <Link to="/help" className="hover:text-uba-red transition-colors">Help & Support</Link>
            </div>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4 mb-6">
              <a href="https://facebook.com/ubaafrica" className="hover:text-uba-red transition-colors" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://twitter.com/UBAGroup" className="hover:text-uba-red transition-colors" aria-label="Twitter">
                <Twitter size={24} />
              </a>
              <a href="https://instagram.com/ubaafrica" className="hover:text-uba-red transition-colors" aria-label="Instagram">
                <Instagram size={24} />
              </a>
            </div>
            <div className="text-sm space-y-2">
              <Link to="/privacy" className="hover:text-uba-red transition-colors">Privacy Policy</Link>
              <br />
              <Link to="/terms" className="hover:text-uba-red transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025 United Bank for Africa Plc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
