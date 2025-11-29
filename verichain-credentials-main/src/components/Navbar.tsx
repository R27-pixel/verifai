import { Shield } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">VerifAI</span>
          </NavLink>
          
          <div className="flex items-center space-x-6">
            <NavLink 
              to="/admin" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Issue Credentials
            </NavLink>
            <NavLink 
              to="/verify" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Verify
            </NavLink>
            <NavLink 
              to="/recruiter" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Search
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
