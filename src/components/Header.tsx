import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';

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
          <NavLink to="/" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Home</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Profile</NavLink>
          <NavLink to="/why-construction" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Why Construction</NavLink>
          <NavLink to="/experience" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Experience</NavLink>
          <NavLink to="/skills" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Skills</NavLink>
          <NavLink to="/qualifications" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Qualifications</NavLink>
          <NavLink to="/availability" className={({ isActive }) => isActive ? "text-theme transition-colors" : "hover:text-theme transition-colors"}>Availability</NavLink>
        </nav>
        
        <div className="hidden xl:block">
          <a 
            href="/Thapelo_Moloantoa_CV.pdf" 
            download="Thapelo_Moloantoa_CV.pdf"
            className="inline-flex bg-theme text-white font-heading font-bold uppercase text-[16px] px-[42px] py-[20px] hover:bg-white hover:text-theme transition-colors items-center gap-2"
          >
            <Download size={20} /> Download CV
          </a>
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
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Home</NavLink>
          <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Profile</NavLink>
          <NavLink to="/why-construction" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Why Construction</NavLink>
          <NavLink to="/experience" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Experience</NavLink>
          <NavLink to="/skills" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Skills</NavLink>
          <NavLink to="/qualifications" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Qualifications</NavLink>
          <NavLink to="/availability" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `p-4 px-[15px] border-b border-white/10 transition-colors ${isActive ? 'text-theme' : 'hover:text-theme'}`}>Availability</NavLink>
          <a href="/Thapelo_Moloantoa_CV.pdf" download="Thapelo_Moloantoa_CV.pdf" onClick={() => setIsMobileMenuOpen(false)} className="p-4 px-[15px] text-theme hover:text-white transition-colors flex items-center gap-2"><Download size={18} /> Download CV</a>
        </div>
      )}
    </header>
  );
}
