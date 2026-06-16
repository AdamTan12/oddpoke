import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('get_my_role').then(({ data }) => {
      setRole(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
