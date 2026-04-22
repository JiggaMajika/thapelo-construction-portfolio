import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import WhyConstruction from './pages/WhyConstruction';
import Experience from './pages/Experience';
import Skills from './pages/Skills';
import Qualifications from './pages/Qualifications';
import AvailabilityReferences from './pages/AvailabilityReferences';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-[90px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/why-construction" element={<WhyConstruction />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/qualifications" element={<Qualifications />} />
            <Route path="/availability" element={<AvailabilityReferences />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
