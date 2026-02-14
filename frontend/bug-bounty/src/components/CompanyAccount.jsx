import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import LoadingSpinner from './LoadingSpinner';

function CompanyAccount({ user, token, refreshUser }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bugs'); // 'bugs' or 'deposit'
    const [myBugs, setMyBugs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Deposit form state
    const [depositAmount, setDepositAmount] = useState('');
    const [depositLoading, setDepositLoading] = useState(false);

    // Create Bug Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bugForm, setBugForm] = useState({
        title: '',
        description: '',
        bounty_amount: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'bugs') {
            fetchMyBugs();
        }
    }, [activeTab]);

    // Fetch company's posted bugs
    const fetchMyBugs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/bugs`);

            if (response.ok) {
                const data = await response.json();
                // Filter only bugs posted by this company
                const companyBugs = data.filter(bug => bug.posted_by?._id === user._id);
                setMyBugs(companyBugs);
            } else {
                setError('Failed to fetch bugs');
            }
        } catch (err) {
            setError('Network error');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle deposit
    const handleDeposit = async (e) => {
        e.preventDefault();

        if (!depositAmount || depositAmount <= 0) {
            alert('Please enter valid amount');
            return;
        }

        setDepositLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/add-balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(depositAmount) })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`₹${depositAmount} added successfully!`);
                setDepositAmount('');
                refreshUser(); // Refresh user balance
            } else {
                alert(data.message || 'Failed to add balance');
            }
        } catch (err) {
            alert('Network error. Please try again.');
            console.error('Deposit error:', err);
        } finally {
            setDepositLoading(false);
        }
    };

    // Handle create bug
    const handleCreateBug = async (e) => {
        e.preventDefault();
        setCreateLoading(true);

        try {
            const response = await fetch(`${API_URL}/bugs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: bugForm.title,
                    description: bugForm.description,
                    bounty_amount: Number(bugForm.bounty_amount)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Bug posted successfully!');
                setShowCreateModal(false);
                setBugForm({ title: '', description: '', bounty_amount: '' });
                fetchMyBugs(); // Refresh bug list
                refreshUser(); // Refresh user balance
            } else {
                alert(data.message || 'Failed to post bug');
            }
        } catch (err) {
            alert('Network error. Please try again.');
            console.error('Create bug error:', err);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Company Account</h1>
                <div className="flex items-center gap-4 text-gray-600">
                    <p>{user.name}</p>
                    <span>•</span>
                    <p>{user.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('bugs')}
                        className={`flex-1 px-6 py-4 font-semibold transition ${activeTab === 'bugs'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Bugs
                    </button>
                    <button
                        onClick={() => setActiveTab('deposit')}
                        className={`flex-1 px-6 py-4 font-semibold transition ${activeTab === 'deposit'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Deposit
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {/* BUGS TAB */}
                    {activeTab === 'bugs' && (
                        <div>
                            {/* Add New Button */}
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition font-semibold text-sm"
                                >
                                    + ADD NEW BUG
                                </button>
                            </div>

                            {/* Bugs List */}
                            {loading ? (
                                <LoadingSpinner message="Loading your bugs..." />
                            ) : myBugs.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-gray-600 text-lg mb-2">No bugs posted yet</p>
                                    <p className="text-sm text-gray-500">Click "ADD NEW BUG" to post your first bug</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {myBugs.map((bug, index) => (
                                        <div
                                            key={bug._id}
                                            onClick={() => navigate(`/bug/${bug._id}`)}
                                            className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-semibold text-sm">
                                                            #{index + 1}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            {bug.title}
                                                        </h3>
                                                    </div>

                                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                                        {bug.description}
                                                    </p>

                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <span className="text-sm text-gray-500">Bounty Amount</span>
                                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                                ₹{bug.bounty_amount?.toLocaleString('en-IN')}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <span className="text-sm text-gray-500 block mb-2">Status</span>
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${bug.status === 'open' ? 'bg-green-100 text-green-700' :
                                                                bug.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {bug.status.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="text-blue-600 hover:text-blue-700 font-semibold ml-4">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DEPOSIT TAB */}
                    {activeTab === 'deposit' && (
                        <div className="max-w-xl mx-auto py-6">
                            {/* Current Balance */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-10 mb-10 shadow-lg">
                                <p className="text-sm opacity-90 mb-3 font-medium">Total Balance</p>
                                <h2 className="text-5xl font-bold">
                                    ₹{user.balance?.toLocaleString('en-IN') || 0}
                                </h2>
                            </div>

                            {/* Deposit Form */}
                            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Amount</h3>
                                <form onSubmit={handleDeposit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Enter amount to deposit
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter amount (e.g., 10000)"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={depositLoading}
                                        className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-bold text-lg disabled:bg-blue-400 flex items-center justify-center"
                                    >
                                        {depositLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            'Deposit Amount'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Bug Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Bug</h2>

                        <form onSubmit={handleCreateBug} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={bugForm.title}
                                        onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Bug title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={bugForm.bounty_amount}
                                        onChange={(e) => setBugForm({ ...bugForm, bounty_amount: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={bugForm.description}
                                    onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe the bug in detail..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
                                >
                                    {createLoading ? 'Posting...' : 'POST'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setBugForm({ title: '', description: '', bounty_amount: '' });
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyAccount;