
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <div className="w-20 h-10 bg-muted animate-pulse rounded-md"></div>;
  }

  if (user) {
    return (
      <Button
        variant="outline"
        onClick={signOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Link to="/auth">
      <Button>Sign In</Button>
    </Link>
  );
};

export default AuthButton;
