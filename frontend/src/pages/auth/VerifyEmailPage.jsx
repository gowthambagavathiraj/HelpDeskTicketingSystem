import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    axios.get(`/api/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Token may be expired.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="card max-w-md w-full text-center p-8">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 text-indigo-500 animate-spin" />
            <h2 className="text-xl font-600 text-white mb-2">Verifying Your Email</h2>
            <p className="text-sm text-slate-400">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-600 text-white mb-2">Email Verified!</h2>
            <p className="text-sm text-slate-400 mb-4">{message}</p>
            <p className="text-xs text-slate-500">Redirecting to login page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-600 text-white mb-2">Verification Failed</h2>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
