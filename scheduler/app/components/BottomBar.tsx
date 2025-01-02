import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function BottomBar() {
  return (
    <div className="w-full bg-secondaryBackground">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex justify-center items-center gap-6">
        <a
          href="mailto:ceitba@itba.edu.ar"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdEmail className="w-5 h-5" />
          <span>Email</span>
        </a>
        <a
          href="https://www.instagram.com/ceitba"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram className="w-5 h-5" />
          <span>Instagram</span>
        </a>
        <a
          href="https://www.linkedin.com/in/ceitba"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin className="w-5 h-5" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
} 