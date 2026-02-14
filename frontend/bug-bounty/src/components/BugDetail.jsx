import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import LoadingSpinner from './LoadingSpinner';

function BugDetail({ user, token, refreshUser }) {
    const { bugId } = useParams();
    const navigate = useNavigate();
    const [bug, setBug] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Submit Solution Modal State
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitForm, setSubmitForm] = useState({
        solution_description: '',
        proof_link: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchBugDetails();
        fetchSubmissions();
    }, [bugId]);

    const fetchBugDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/bugs/${bugId}`);

            if (response.ok) {
                const data = await response.json();
                setBug(data);
            } else {
                setError('Bug not found');
            }
        } catch (err) {
            setError('Failed to fetch bug details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${API_URL}/submissions/bug/${bugId}`);

            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        }
    };

    const handleSubmitSolution = async (e) => {
        e.preventDefault();

        if (!token) {
            alert('Please login to submit solution');
            navigate('/login');
            return;
        }

        setSubmitLoading(true);

        try {
            const response = await fetch(`${API_URL}/bugs/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bug_id: bugId,
                    solution_description: submitForm.solution_description,
                    proof_link: submitForm.proof_link
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Solution submitted successfully!');
                setShowSubmitModal(false);
                setSubmitForm({ solution_description: '', proof_link: '' });
                fetchSubmissions(); // Refresh submissions
            } else {
                alert(data.message || 'Failed to submit solution');
            }
        } catch (err) {
            alert('Network error. Please try again.');
            console.error('Submit error:', err);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleApproveSubmission = async (submissionId) => {
        if (!window.confirm('Are you sure you want to approve this submission?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/submissions/approve/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Submission approved! Bounty sent to developer.');

                await Promise.all([
                    fetchBugDetails(),
                    fetchSubmissions(),
                    refreshUser()
                ]);
            } else {
                alert(data.message || 'Failed to approve submission');
            }
        } catch (err) {
            alert('Network error. Please try again.');
            console.error('Approve error:', err);
        }
    };

    const handleRejectSubmission = async (submissionId) => {
        if (!window.confirm('Are you sure you want to reject this submission?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/submissions/reject/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Submission rejected.');
                await Promise.all([
                    fetchBugDetails(),
                    fetchSubmissions()
                ]);
            } else {
                alert(data.message || 'Failed to reject submission');
            }
        } catch (err) {
            alert('Network error. Please try again.');
            console.error('Reject error:', err);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading bug details..." />;
    }

    if (error || !bug) {
        return (
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
                    Back to Dashboard
                </Link>
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                    {error || 'Bug not found'}
                </div>
            </div>
        );
    }

    const isCompanyOwner = user?.role === 'company' && bug.posted_by?._id === user._id;
    const isDeveloper = user?.role === 'developer';

    return (
        <div className="max-w-4xl mx-auto">

            <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
                Back to Dashboard
            </Link>

            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{bug.title}</h1>
                    <span className="text-sm text-gray-500">
                        Submissions: {submissions.length}
                    </span>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Bug Description:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{bug.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Bounty Amount</p>
                        <p className="text-3xl font-bold text-gray-900">
                            ₹{bug.bounty_amount?.toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${bug.status === 'open' ? 'bg-green-100 text-green-700' :
                            bug.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {bug.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {isDeveloper && (bug.status === 'open' || bug.status === 'in_review') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Submit Your Solution</h3>
                    <p className="text-gray-600 mb-4">
                        Have you fixed this bug? Submit your solution with proof!
                    </p>
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Submit Solution
                    </button>
                </div>
            )}

            {isDeveloper && bug.status === 'closed' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bug Closed</h3>
                    <p className="text-gray-600">
                        This bug has been closed. A winner has already been selected.
                    </p>
                    {bug.winner && (
                        <p className="text-sm text-gray-500 mt-2">
                            Winner: {bug.winner.name || 'Developer'}
                        </p>
                    )}
                </div>
            )}

            {!user && bug.status !== 'closed' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to solve this bug?</h3>
                    <p className="text-gray-600 mb-4">
                        Please login to submit your solution
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Login to Submit
                    </button>
                </div>
            )}

            {/* Company View - Submissions List */}
            {isCompanyOwner && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-gray-200">
                        Submissions ({submissions.length})
                    </h2>

                    {submissions.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg">No submissions yet</p>
                            <p className="text-sm mt-2">Waiting for developers to submit solutions</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {submissions.map((submission) => (
                                <SubmissionCard
                                    key={submission._id}
                                    submission={submission}
                                    onApprove={handleApproveSubmission}
                                    onReject={handleRejectSubmission}
                                    bugStatus={bug.status}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Solution Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Solution</h2>

                        <form onSubmit={handleSubmitSolution} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Solution Description
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={submitForm.solution_description}
                                    onChange={(e) => setSubmitForm({ ...submitForm, solution_description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe how you fixed the bug..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proof Link
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={submitForm.proof_link}
                                    onChange={(e) => setSubmitForm({ ...submitForm, proof_link: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://github.com/your-repo/pull/123"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    {submitLoading ? 'Submitting...' : 'Submit Solution'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition"
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

// Submission Card Component (for Company view)
function SubmissionCard({ submission, onApprove, onReject, bugStatus }) {
    return (
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition bg-white">
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h4 className="font-bold text-lg text-gray-900">
                        {submission.submitted_by?.name || 'Developer'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Submitted on: {new Date(submission.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold ${submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                    submission.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {submission.status.toUpperCase()}
                </span>
            </div>

            <div className="mb-5">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Solution Description:</h5>
                <p className="text-gray-700 leading-relaxed">{submission.solution_description}</p>
            </div>

            <div className="mb-5">
                <a
                    href={submission.proof_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                    View Proof Link →
                </a>
            </div>

            {/* Show buttons only for pending submissions */}
            {(bugStatus === 'open' || bugStatus === 'in_review') && submission.status === 'pending' && (
                <div className="flex gap-4 pt-5 border-t-2 border-gray-200">
                    <button
                        onClick={() => onApprove(submission._id)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold text-sm"
                    >
                        ✓ Accept
                    </button>
                    <button
                        onClick={() => onReject(submission._id)}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-bold text-sm"
                    >
                        ✗ Reject
                    </button>
                </div>
            )}
        </div>
    );
}

export default BugDetail;