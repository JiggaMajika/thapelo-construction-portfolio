export default function Footer() {
  return (
    <footer className="bg-[#141414] text-white pt-[80px] pb-[40px] border-t-4 border-theme">
      <div className="max-w-[1170px] mx-auto px-[15px] grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div>
          <h3 className="font-heading font-bold text-[24px] mb-6 text-white uppercase">Thapelo Moloantoa</h3>
          <p className="font-body text-[#868A8A] mb-6">
            Construction Apprenticeship Candidate based in Luton, bringing 20+ years of reliable, safety-first experience to the built environment.
          </p>
        </div>
        <div>
          <h3 className="font-heading font-bold text-[20px] mb-6 text-white uppercase">Contact Info</h3>
          <ul className="text-[#868A8A] space-y-3 font-body">
            <li className="flex items-start gap-2">
              <span className="text-theme font-bold">A:</span> Flat 3, 31 Alma Street, Luton LU1 2PL
            </li>
            <li className="flex items-start gap-2">
              <span className="text-theme font-bold">P:</span> 07365 447103
            </li>
            <li className="flex items-start gap-2">
              <span className="text-theme font-bold">E:</span> thapelomoloantoa@yahoo.com
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-heading font-bold text-[20px] mb-6 text-white uppercase">Supported By</h3>
          <ul className="text-[#868A8A] space-y-3 font-body">
            <li>Connect to Work (Luton Council)</li>
            <li>Referred via Luton Borough Council Directorate of Inclusive Growth</li>
            <li>Job Coach: Zain Ahmed</li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1170px] mx-auto px-[15px] pt-[30px] border-t border-white/10 text-center text-[#868A8A] font-body text-sm">
        &copy; {new Date().getFullYear()} Thapelo Moloantoa. All rights reserved. Built for Construction Apprenticeship Application.
      </div>
    </footer>
  );
}
