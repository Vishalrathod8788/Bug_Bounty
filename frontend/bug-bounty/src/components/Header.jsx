import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ user, logout }) {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">

                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <span className="text-2xl font-bold text-gray-800">
                            BugBounty
                        </span>
                    </Link>


                    <nav className="flex items-center gap-6">
                        {!user ? (
                            // Not logged in - Show Login/Register
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className={`px-6 py-2.5 rounded-md font-medium transition ${currentPath === '/login'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className={`px-6 py-2.5 rounded-md font-medium transition ${currentPath === '/register'
                                        ? 'bg-blue-700 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            // Logged in - Show user options
                            <div className="flex items-center gap-6">
                                <Link
                                    to="/"
                                    className={`px-6 py-2.5 rounded-md font-medium transition ${currentPath === '/'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Home
                                </Link>

                                {/* Company specific button */}
                                {user.role === 'company' && (
                                    <Link
                                        to="/company"
                                        className={`px-6 py-2.5 rounded-md font-medium transition ${currentPath === '/company'
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        Account
                                    </Link>
                                )}

                                {/* User Info */}
                                <div className="flex items-center gap-4 ml-6 pl-6 border-l-2 border-gray-200">
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                                            ₹{user.balance?.toLocaleString('en-IN') || 0}
                                        </div>
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;