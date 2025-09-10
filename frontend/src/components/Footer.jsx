import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-300 py-4 mt-0 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-auto mb-2 md:mb-0">
            <p className="text-gray-700 font-semibold">MediBeauty Vision</p>
          </div>
          
          <div className="flex space-x-4 mb-2 md:mb-0">
            <a href="https://www.facebook.com/share/1C2YgZN3jW/" className="text-gray-700 hover:text-gray-900">
              <Facebook size={16} />
            </a>
            <a href="https://www.instagram.com/kha.dija_bouabidi?igsh=M2pnMXc0bDg1N2tv" className="text-gray-700 hover:text-gray-900">
              <Instagram size={16} />
            </a>
            <a href="https://x.com/Bouabidi607" className="text-gray-700 hover:text-gray-900">
              <Twitter size={16} />
            </a>
          </div>
          
          <div className="w-full md:w-auto text-center md:text-right">
            <p className="text-gray-700 text-xs">
              &copy; {currentYear} MediBeauty Vision. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;