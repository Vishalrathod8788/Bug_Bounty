import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import LoadingSpinner from './LoadingSpinner';

function Dashboard() {
    const navigate = useNavigate();
    const [bugs, setBugs] = useState([]);
    const [filteredBugs, setFilteredBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, open, in_review, closed
    const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, bounty_desc, bounty_asc

    useEffect(() => {
        fetchBugs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [bugs, searchQuery, statusFilter, sortBy]);

    const fetchBugs = async () => {
        try {
            const response = await fetch(`${API_URL}/bugs`);

            if (response.ok) {
                const data = await response.json();
                setBugs(data);
            } else {
                setError('Failed to fetch bugs');
            }
        } catch (err) {
            setError('Network error. Please check if backend is running.');
            console.error('Error fetching bugs:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...bugs];

        // Search Filter
        if (searchQuery.trim()) {
            result = result.filter(bug =>
                bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bug.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(bug => bug.status === statusFilter);
        }

        // Sort
        switch (sortBy) {
            case 'date_desc':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date_asc':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'bounty_desc':
                result.sort((a, b) => b.bounty_amount - a.bounty_amount);
                break;
            case 'bounty_asc':
                result.sort((a, b) => a.bounty_amount - b.bounty_amount);
                break;
            default:
                break;
        }

        setFilteredBugs(result);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSortBy('date_desc');
    };

    if (loading) {
        return <LoadingSpinner message="Loading bugs..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-10">
                <h1 className="text-5xl font-bold text-gray-900 mb-3">Dashboard</h1>
                <p className="text-gray-600 text-lg">Browse all available bug bounties</p>
            </div>

            {error && (
                <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Bugs
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title or description..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_review">In Review</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="date_desc">Latest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="bounty_desc">Bounty: High to Low</option>
                            <option value="bounty_asc">Bounty: Low to High</option>
                        </select>
                    </div>
                </div>

                {(searchQuery || statusFilter !== 'all' || sortBy !== 'date_desc') && (
                    <div className="mt-4">
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{filteredBugs.length}</span> of{' '}
                    <span className="font-semibold">{bugs.length}</span> bugs
                </p>

                {(searchQuery || statusFilter !== 'all') && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Active filters:</span>
                        {searchQuery && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                Search: "{searchQuery}"
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                Status: {statusFilter.replace('_', ' ').toUpperCase()}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {filteredBugs.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {bugs.length === 0 ? 'No bugs posted yet' : 'No bugs found'}
                    </h3>
                    <p className="text-gray-500">
                        {bugs.length === 0
                            ? 'Be the first to post a bug bounty!'
                            : 'Try adjusting your search or filters'
                        }
                    </p>
                    {filteredBugs.length === 0 && bugs.length > 0 && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBugs.map((bug) => (
                        <BugCard
                            key={bug._id}
                            bug={bug}
                            onClick={() => navigate(`/bug/${bug._id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


function BugCard({ bug, onClick }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'in_review':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'closed':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        return status.replace('_', ' ').toUpperCase();
    };

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                {bug.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {bug.description}
            </p>


            <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Bounty Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ₹{bug.bounty_amount?.toLocaleString('en-IN')}
                        </p>
                    </div>


                    <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bug.status)}`}>
                            {getStatusText(bug.status)}
                        </span>
                    </div>
                </div>


                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Posted by: {bug.posted_by?.name || 'Company'}</span>
                    <span className="font-medium">
                        View Details →
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;