import PageBanner from '../components/PageBanner';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-[#F7F7F7]">
      <PageBanner title="Contact" breadcrumb="Contact" />
      
      <section className="py-[80px] lg:py-[120px]">
        <div className="max-w-[800px] mx-auto px-[15px]">
          <div className="text-center mb-16">
            <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
              <span className="w-12 h-[3px] bg-theme inline-block"></span> Get In Touch
            </h4>
            <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1]">
              Ready For Immediate Start
            </h2>
            <p className="font-body text-[18px] text-body mt-6 leading-relaxed">
              I am available to start an apprenticeship or supported work-experience placement at short notice. Eligible to work in the UK without restriction and hold a full clean UK driving licence.
            </p>
          </div>
          
          <div className="bg-white p-10 lg:p-14 shadow-xl border-t-8 border-theme">
            <h3 className="font-heading font-bold text-[30px] uppercase text-title mb-8 text-center border-b pb-6">Direct Contact Information</h3>
            
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-theme/10 flex items-center justify-center shrink-0 rounded-full">
                  <Phone className="w-10 h-10 text-theme" />
                </div>
                <div>
                   <h4 className="font-heading font-bold text-title uppercase text-[20px] mb-1">Phone</h4>
                   <p className="font-body text-body text-[22px] font-medium">07365 447103</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-theme/10 flex items-center justify-center shrink-0 rounded-full">
                  <Mail className="w-10 h-10 text-theme" />
                </div>
                <div>
                   <h4 className="font-heading font-bold text-title uppercase text-[20px] mb-1">Email</h4>
                   <a href="mailto:thapelomoloantoa@yahoo.com" className="font-body text-theme hover:text-title transition-colors text-[22px] font-medium break-all">
                     thapelomoloantoa@yahoo.com
                   </a>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-theme/10 flex items-center justify-center shrink-0 rounded-full">
                  <MapPin className="w-10 h-10 text-theme" />
                </div>
                <div>
                   <h4 className="font-heading font-bold text-title uppercase text-[20px] mb-1">Location</h4>
                   <p className="font-body text-body text-[20px] leading-relaxed">Flat 3, 31 Alma Street<br/>Luton, LU1 2PL</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t text-center">
               <p className="font-body text-[#666666] text-[18px] mb-6">Medical documentation, full CV, driving documents, and DBS certificate available securely upon request.</p>
               <a href="mailto:thapelomoloantoa@yahoo.com" className="inline-block bg-title text-white font-heading font-bold uppercase text-[18px] px-[42px] py-[20px] hover:bg-theme transition-colors shadow-lg">
                 Email Me Directly
               </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
