import PageBanner from '../components/PageBanner';
import { CheckCircle2, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Skills() {
  return (
    <div>
      <PageBanner title="Practical Skills" breadcrumb="Skills" />
      
      {/* Key Strengths */}
      <section className="py-[80px] lg:py-[120px] bg-white">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="text-center mb-16">
            <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
              <span className="w-12 h-[3px] bg-theme inline-block"></span> Core Foundation
            </h4>
            <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1]">
              Key Strengths For Construction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-grey p-10 border-t-4 border-theme shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <CheckCircle2 className="w-12 h-12 text-theme mb-6 relative z-10" />
              <h3 className="font-heading font-bold text-[22px] text-title uppercase mb-4 relative z-10">Reliable & Punctual</h3>
              <p className="font-body text-[18px] text-body leading-relaxed relative z-10">
                Maintains an extremely strong work ethic. I possess a demonstrable track record of consistent attendance across demanding stadium event days, crucial school-cover supervision, and dynamic retail shifts.
              </p>
            </div>
            
            <div className="bg-grey p-10 border-t-4 border-title shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <ShieldCheck className="w-12 h-12 text-title mb-6 relative z-10" />
              <h3 className="font-heading font-bold text-[22px] text-theme uppercase mb-4 relative z-10">Safety-First Mindset</h3>
              <p className="font-body text-[18px] text-body leading-relaxed relative z-10">
                Formally trained within strict operational environments. Highly comfortable analyzing site briefings, adhering to risk assessments, and executing safe-systems-of-work without fail.
              </p>
            </div>
            
            <div className="bg-grey p-10 border-t-4 border-theme shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <ShieldCheck className="w-12 h-12 text-theme mb-6 relative z-10" />
              <h3 className="font-heading font-bold text-[22px] text-title uppercase mb-4 relative z-10">Fully Vetted Candidate</h3>
              <p className="font-body text-[18px] text-body leading-relaxed relative z-10">
                Strict background checks successfully maintained. Fully DBS-cleared throughout all periods of my teaching, supervision, and youth football coaching roles.
              </p>
            </div>

            <div className="bg-grey p-10 border-t-4 border-title shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <Wrench className="w-12 h-12 text-title mb-6 relative z-10" />
              <h3 className="font-heading font-bold text-[22px] text-theme uppercase mb-4 relative z-10">Integrated Team Player</h3>
              <p className="font-body text-[18px] text-body leading-relaxed relative z-10">
                Adept at functioning seamlessly within structured hierarchies. I have supervised small, agile teams while simultaneously taking precise instruction from shift leaders during massive, high-pressure events.
              </p>
            </div>

            <div className="bg-grey p-10 border-t-4 border-theme shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <CheckCircle2 className="w-12 h-12 text-theme mb-6 relative z-10" />
              <h3 className="font-heading font-bold text-[22px] text-title uppercase mb-4 relative z-10">Deployable Transport</h3>
              <p className="font-body text-[18px] text-body leading-relaxed relative z-10">
                Fully licensed to drive cars, light-to-medium vehicles, and mopeds. Highly capable of traveling reliably to early-start sites across Luton and the broader surrounding areas.
              </p>
            </div>

            <div className="bg-grey p-10 border-t-4 border-title shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <Wrench className="w-12 h-12 text-title mb-6 relative z-10" />
              <h3 className="font-heading font-bold text-[22px] text-theme uppercase mb-4 relative z-10">Clear Communication</h3>
              <p className="font-body text-[18px] text-body leading-relaxed relative z-10">
                Composed under pressure with excellent cross-cultural communication skills. Proficient at retaining complex briefings and elevating site concerns promptly via the correct operational channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Capabilities */}
      <section className="py-[80px] lg:py-[120px] bg-title text-white border-b-8 border-theme">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <h3 className="font-heading font-bold text-[40px] uppercase mb-10 text-white leading-[1.1]">
                  Practical Project Competencies
                </h3>
                
                <div className="space-y-6">
                  <div className="bg-white/5 p-8 border border-white/10 flex gap-6 md:items-center flex-col md:flex-row">
                    <div className="shrink-0"><CheckCircle2 className="text-theme w-10 h-10"/></div>
                    <div>
                      <h4 className="font-heading font-bold text-[24px] uppercase mb-2">Operational Environments</h4>
                      <p className="font-body text-[18px] text-white/80 leading-relaxed">Highly experienced in navigating strict stadium logistics, high-volume warehouse fulfillment (Amazon), active retail floors, and challenging outdoor elements.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-8 border border-white/10 flex gap-6 md:items-center flex-col md:flex-row">
                    <div className="shrink-0"><CheckCircle2 className="text-theme w-10 h-10"/></div>
                    <div>
                      <h4 className="font-heading font-bold text-[24px] uppercase mb-2">Methodical Tool Adoption</h4>
                      <p className="font-body text-[18px] text-white/80 leading-relaxed">Familiar with an array of industrial technology, including point-of-sale systems, site radios, inventory scanners, and commercial equipment. I adapt to new project tools swiftly and safely.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-8 border border-white/10 flex gap-6 md:items-center flex-col md:flex-row">
                    <div className="shrink-0"><CheckCircle2 className="text-theme w-10 h-10"/></div>
                    <div>
                      <h4 className="font-heading font-bold text-[24px] uppercase mb-2">Multilingual Fluency</h4>
                      <p className="font-body text-[18px] text-white/80 leading-relaxed">English (Advanced / Native-standard), Afrikaans (Intermediate), German (Elementary). Able to communicate broadly across diverse, multicultural site teams.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link to="/qualifications" className="bg-theme text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-theme transition-colors inline-block w-full text-center md:w-auto shadow-xl">
                     View Formal Qualifications
                  </Link>
                </div>
             </div>
             <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Architectural diagrams and planning, showing precision and skill. No people."
                  className="w-full h-[650px] object-cover shadow-2xl border-t-8 border-theme"
                  crossOrigin="anonymous"
                />
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}
