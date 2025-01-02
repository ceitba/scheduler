import Link from 'next/link';

const BottomBar = () => {
  return (
    <footer className="w-full py-4 px-4 text-center">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray">
        <Link 
          href="https://github.com/urielsv/scheduler" 
          target="_blank"
          className="hover:text-primary transition-colors duration-200"
        >
          GitHub
        </Link>
        <span>•</span>
        <Link 
          href="https://ceitba.org.ar" 
          target="_blank"
          className="hover:text-primary transition-colors duration-200"
        >
          CEITBA
        </Link>
        <span>•</span>
        <Link 
          href="https://www.itba.edu.ar" 
          target="_blank"
          className="hover:text-primary transition-colors duration-200"
        >
          ITBA
        </Link>
      </div>
    </footer>
  );
};

export default BottomBar; 