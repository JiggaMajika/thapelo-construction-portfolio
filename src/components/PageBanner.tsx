export default function PageBanner({ title, breadcrumb }: { title: string, breadcrumb: string }) {
  return (
    <div className="relative h-[350px] md:h-[450px] bg-[#0D0D0D] flex items-center justify-center mt-[-90px] pt-[90px] overflow-hidden">
      {/* Background Image - Strict No People */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/80 z-10" />
        <img 
          src="https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Architectural structure silhouette, construction materials, heavy machinery details. STRICT NO PEOPLE."
          className="w-full h-full object-cover grayscale opacity-50"
          crossOrigin="anonymous"
        />
      </div>
      
      <div className="relative z-20 text-center px-[15px]">
        <h1 className="font-heading font-bold text-[45px] md:text-[60px] text-white uppercase mb-4 leading-tight">
          {title}
        </h1>
        <div className="font-heading font-medium text-[16px] md:text-[18px] text-theme uppercase tracking-wider">
          <span className="text-white">Home</span> <span className="mx-2">/</span> {breadcrumb}
        </div>
      </div>
    </div>
  );
}
