'use client';

import { FiGithub, FiHeart, FiMail } from 'react-icons/fi';
import Link from 'next/link';
import Changelog from './Changelog';

const BottomBar = () => {
  const currentYear = new Date().getFullYear();
  const creators = [
    'Ian Dalton',
    'Lautaro Bonseñor',
    'Camila Lee',
    'Uriel Sosa Vázquez'
  ];

  return (
    <footer className="w-full bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-3 px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm">
            <Link 
              href="https://github.com/CEITBA-git/scheduler" 
              target="_blank"
              className="underline hover:text-primary transition-all duration-200 flex items-center gap-1.5"
            >
              <FiGithub className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>GitHub</span>
            </Link>
            <Link 
              href="https://ceitba.org.ar" 
              target="_blank"
              className="underline hover:text-primary transition-all duration-200"
            >
              CEITBA
            </Link>
            <Link 
              href="https://www.itba.edu.ar" 
              target="_blank"
              className="underline hover:text-primary transition-all duration-200"
            >
              ITBA
            </Link>
            <Link 
              href="mailto:ceitba@itba.edu.ar"
              className="underline hover:text-primary transition-all duration-200 flex items-center gap-1.5"
            >
              <FiMail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Contacto</span>
            </Link>
            <Changelog />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray/80">
            <div className="relative group">
              <div className="flex items-center gap-1.5">
                <span>Desarrollado por</span>
                <FiHeart className="h-3 w-3 text-red-400" />
                <span className="text-primary">IT Team CEITBA</span>
              </div>
              
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
                <div className="bg-background bg-opacity-15 backdrop-opacity-90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                  {creators.map((creator, index) => (
                    <div
                      key={creator}
                      className="px-4 py-1.5 hover:bg-primary transition-colors duration-200 text-xs whitespace-nowrap"
                      style={{
                        animation: `slideIn 0.2s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {creator}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span className="mx-1.5">•</span>
            <span>{currentYear}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 4;
            transform: translateY(0);
          }
        }
      `}</style>
    </footer>
  );
};

export default BottomBar;