
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LinkHubLogoProps {
  className?: string;
  showText?: boolean;
}

const LinkHubLogo = ({ className = "", showText = true }: LinkHubLogoProps) => {
  const { user } = useAuth();
  
  // Navigate to /links if signed in, otherwise to home page
  const targetRoute = user ? '/links' : '/';

  return (
    <Link 
      to={targetRoute} 
      className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}
    >
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold">L</span>
      </div>
      {showText && <h1 className="text-xl font-semibold">LinkHub</h1>}
    </Link>
  );
};

export default LinkHubLogo;
