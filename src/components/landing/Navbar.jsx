import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-surface-bg/85 backdrop-blur-xl border-b border-gray-200/60 animate-fade-in">
      <Logo />

      <div className="flex items-center gap-8">
        <a href="#features" className="hidden md:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Features
        </a>
        <a href="#about" className="hidden md:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          About
        </a>
        <a href="#contact" className="hidden md:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Contact
        </a>
        <Link
          to="/login"
          className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all hover:-translate-y-0.5"
        >
          Login →
        </Link>
      </div>
    </nav>
  );
}
