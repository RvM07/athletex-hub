import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminSetup = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setMessage('❌ Not logged in. Please login first.');
        setLoading(false);
        return;
      }

      setUserEmail(session.user.email || '');

      // Get current role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        setMessage(`❌ Error fetching profile: ${error.message}`);
      } else {
        setUserRole(profile?.role || 'user');
        if (profile?.role === 'admin') {
          setMessage('✅ You are already an admin! Redirecting to dashboard...');
          setTimeout(() => navigate('/admin'), 2000);
        }
      }
      
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const makeAdmin = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', (await supabase.auth.getSession()).data?.session?.user?.id);

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage('✅ Successfully set as admin! Refreshing...');
      setUserRole('admin');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8">
        <h1 className="text-3xl font-display mb-6 text-center">ADMIN SETUP</h1>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Email:</p>
            <p className="font-medium break-all">{userEmail || 'N/A'}</p>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Role:</p>
            <p className={`font-medium text-lg ${
              userRole === 'admin' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {userRole.toUpperCase()}
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : message.includes('❌')
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
          }`}>
            {message}
          </div>
        )}

        {userRole !== 'admin' && (
          <div className="space-y-3">
            <Button
              onClick={makeAdmin}
              disabled={updating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {updating ? 'Setting Admin...' : 'Make Me Admin'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Click the button above to grant admin access to your account
            </p>
          </div>
        )}

        {userRole === 'admin' && (
          <Button
            onClick={() => navigate('/admin')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Go to Admin Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminSetup;
