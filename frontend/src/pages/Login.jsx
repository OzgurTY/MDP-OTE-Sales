import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to sign in: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-slate-200">
                <div className="flex justify-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Welcome Back</h2>
                <p className="text-slate-500 text-sm text-center mb-8">Sign in to MDP Sales Calculator</p>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-xs">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Email</label>
                        <input
                            type="email"
                            className="block w-full rounded-md border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Password</label>
                        <input
                            type="password"
                            className="block w-full rounded-md border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-zinc-800 transition duration-200 mt-2 shadow-lg shadow-zinc-900/10"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
