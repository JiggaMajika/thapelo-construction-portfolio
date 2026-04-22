import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-[#141414] text-white border-b border-white/10 shadow-lg">
      <div className="max-w-[1170px] mx-auto px-[15px] h-[90px] flex items-center justify-between">
        <Link to="/" className="text-[24px] font-heading font-bold text-white flex items-center gap-2 uppercase tracking-wide">
          <span className="text-theme">THAPELO</span> M.
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-5 font-heading font-medium text-[15px] uppercase tracking-wide">
          <Link to="/" className="hover:text-theme transition-colors">Home</Link>
          <Link to="/profile" className="hover:text-theme transition-colors">Profile</Link>
          <Link to="/why-construction" className="hover:text-theme transition-colors">Why Construction</Link>
          <Link to="/experience" className="hover:text-theme transition-colors">Experience</Link>
          <Link to="/skills" className="hover:text-theme transition-colors">Skills</Link>
          <Link to="/qualifications" className="hover:text-theme transition-colors">Qualifications</Link>
          <Link to="/availability" className="hover:text-theme transition-colors">Availability</Link>
        </nav>
        
        <div className="hidden xl:block">
          <Link 
            to="/contact" 
            className="inline-flex bg-theme text-white font-heading font-bold uppercase text-[16px] px-[42px] py-[20px] hover:bg-white hover:text-theme transition-colors"
          >
            Contact Me
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="xl:hidden text-white hover:text-theme p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#141414] border-t border-white/10 absolute top-[90px] left-0 w-full flex flex-col font-heading font-medium text-[16px] uppercase tracking-wide shadow-xl">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Home</Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Profile</Link>
          <Link to="/why-construction" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Why Construction</Link>
          <Link to="/experience" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Experience</Link>
          <Link to="/skills" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Skills</Link>
          <Link to="/qualifications" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Qualifications</Link>
          <Link to="/availability" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] border-b border-white/10 hover:text-theme transition-colors">Availability</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] text-theme hover:text-white transition-colors">Contact Me</Link>
        </div>
      )}
    </header>
  );
}
