import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Logout(): JSX.Element {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void signOut().then(() => {
      navigate("/", { replace: true });
    });
  }, [navigate, signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F6] font-sans text-[#0F2A1D]">
      Signing out...
    </div>
  );
}
