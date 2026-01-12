import React from 'react';
import { Icon } from '../ui/Icon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#181410] text-white py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="temple_hindu" className="text-primary text-2xl" />
              <span className="text-xl font-bold">Shravan Kumar</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering children to fulfill their sacred duty. The world's most trusted pilgrimage service for the elderly.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                href="#"
              >
                <Icon name="alternate_email" className="text-sm" />
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                href="#"
              >
                <Icon name="call" className="text-sm" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-lg">Company</h4>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                About Us
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Our Story
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Careers
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Press
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-lg">Journeys</h4>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                North India
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                South India
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Char Dham
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Custom Plans
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-lg">Support</h4>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Safety Protocols
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Help Center
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Terms of Service
              </a>
              <a className="text-gray-400 text-sm hover:text-white" href="#">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2024 Shravan Kumar Pilgrimages. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with devotion in India.</p>
        </div>
      </div>
    </footer>
  );
};
