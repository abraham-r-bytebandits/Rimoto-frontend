import { FacebookFilled, InstagramOutlined, YoutubeFilled, XOutlined } from '@ant-design/icons';

export default function Footer() {
  return (
    <footer className="w-full relative bg-[#111111] overflow-hidden">
      {/* Top Section with Split Background */}
      <div className="relative min-h-[350px] flex flex-col md:flex-row">
        {/* Left White Slanted Section */}
        <div
          className="bg-white w-full md:w-[55%] z-10 px-10 py-16 flex flex-col justify-center"
          style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 120px) 100%, 0 100%)' }}
        >
          <div className="max-w-[400px] ml-[20%]">
            <img src="/footerLogo.png" alt="Rimoto Logo" className="w-full h-full max-w-[300px] mb-6 object-contain" />
          </div>
        </div>

        {/* Right Black Section Content */}
        <div className="bg-[#111111] w-full md:w-[45%] md:absolute md:right-0 md:top-0 h-full px-10 py-16 text-[#A0A0A0] flex flex-col justify-center">
          <div className="max-w-[500px] ml-auto w-full grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3 text-[11px] tracking-wide">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Warranty Policy</a>
              <a href="#" className="hover:text-white transition-colors">Returns and<br />Exchanges</a>
              <a href="#" className="hover:text-white transition-colors">Repair & Alteration</a>
              <a href="#" className="hover:text-white transition-colors">EU Declaration of<br />Conformity certificate</a>
            </div>

            <div className="flex flex-col gap-4 text-[11px] tracking-wide">
              <h3 className="text-white font-bold uppercase tracking-widest mb-1 text-[12px]">CONTACT US</h3>

              <a href="tel:+917449102000" className="hover:text-white transition-colors underline underline-offset-4">
                +91 7449102000
              </a>

              <a href="mailto:contact@rimotogear.com" className="hover:text-white transition-colors underline underline-offset-4">
                contact@rimotogear.com
              </a>

              <p className="leading-relaxed">
                Address- A16, SIDCO Industrial<br />
                Estate, MMDA Colony,<br />
                Arumbakkam, Chennai -<br />
                600106
              </p>

              <div className="flex gap-5 mt-2 text-white items-center">
                <a href="#" className="hover:text-[#E8FF47] transition-colors text-[17px]">
                  <FacebookFilled />
                </a>
                <a href="#" className="hover:text-[#E8FF47] transition-colors text-[19px]">
                  <InstagramOutlined />
                </a>
                <a href="#" className="hover:text-[#E8FF47] transition-colors text-[19px]">
                  <YoutubeFilled />
                </a>
                <a href="#" className="hover:text-[#E8FF47] transition-colors text-[17px]">
                  <XOutlined />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Image Banner */}
      <div className="relative w-full bg-[#1A1A1A] border-t border-[#333333]">
        <img
          src="/bottomFooterImg.webp"
          alt="Rimoto Background"
          className="w-full h-auto object-cover opacity-80"
        />
      </div>
    </footer>
  );
}