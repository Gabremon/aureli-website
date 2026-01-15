import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';
import './Positions.css';

interface Position {
  id: number;
  business_id: number;
  job_title: string;
  job_description: string | null;
  created_at: string;
  updated_at: string;
}

export default function Positions() {
  const { user, token } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    job_title: '',
    job_description: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPositions();
  }, [token]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/positions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch positions');
      }

      const data = await response.json();
      setPositions(data.positions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (successMessage) setSuccessMessage(null);
    if (error) setError(null);
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.job_title.trim()) {
      setError('Job title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/positions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: formData.job_title.trim(),
          job_description: formData.job_description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create position');
      }

      await fetchPositions();
      setFormData({ job_title: '', job_description: '' });
      setShowAddModal(false);
      setSuccessMessage('Position created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create position');
      console.error('Error creating position:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      job_title: position.job_title,
      job_description: position.job_description || '',
    });
    setShowEditModal(true);
  };

  const handleUpdatePosition = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPosition || !formData.job_title.trim()) {
      setError('Job title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/positions/${editingPosition.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: formData.job_title.trim(),
          job_description: formData.job_description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update position');
      }

      await fetchPositions();
      setShowEditModal(false);
      setEditingPosition(null);
      setFormData({ job_title: '', job_description: '' });
      setSuccessMessage('Position updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update position');
      console.error('Error updating position:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm('Are you sure you want to delete this position?')) {
      return;
    }

    try {
      setDeleting(id);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/positions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete position');
      }

      await fetchPositions();
      setSuccessMessage('Position deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete position');
      console.error('Error deleting position:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingPosition(null);
    setFormData({ job_title: '', job_description: '' });
    setError(null);
  };

  if (loading) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="positions-loading">
              <p>Loading positions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page business-dashboard">
      <BusinessHeader />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="positions-container">
            <div className="positions-header">
              <div>
                <h1 className="positions-title">Positions</h1>
                <p className="positions-subtitle">
                  Manage job positions and descriptions for your business
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="button-primary"
              >
                + Add Position
              </button>
            </div>

            {error && (
              <div className="positions-error">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="positions-success">
                {successMessage}
              </div>
            )}

            <div className="positions-content">
              {positions.length === 0 ? (
                <div className="empty-state">
                  <p>No positions yet. Create your first position to get started.</p>
                </div>
              ) : (
                <div className="positions-table-container">
                  <table className="positions-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Job Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.id}>
                          <td className="position-title">{position.job_title}</td>
                          <td className="position-description">
                            {position.job_description || (
                              <span className="no-description">No description</span>
                            )}
                          </td>
                          <td className="position-actions">
                            <button
                              onClick={() => handleEditClick(position)}
                              className="button-secondary button-small"
                              disabled={deleting === position.id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePosition(position.id)}
                              className="button-danger button-small"
                              disabled={deleting === position.id}
                            >
                              {deleting === position.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add Position Modal */}
            {showAddModal && (
              <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content position-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Add New Position</h3>
                    <button className="modal-close" onClick={handleCloseModal}>×</button>
                  </div>
                  <form onSubmit={handleAddPosition}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label htmlFor="job_title">
                          Job Title <span className="required">*</span>
                        </label>
                        <input
                          id="job_title"
                          name="job_title"
                          type="text"
                          value={formData.job_title}
                          onChange={handleInputChange}
                          placeholder="e.g., Software Engineer, Customer Service Representative"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="job_description">Job Description</label>
                        <textarea
                          id="job_description"
                          name="job_description"
                          value={formData.job_description}
                          onChange={handleInputChange}
                          placeholder="Enter job description..."
                          rows={6}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={handleCloseModal}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="button-primary"
                        disabled={submitting || !formData.job_title.trim()}
                      >
                        {submitting ? 'Creating...' : 'Create Position'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Position Modal */}
            {showEditModal && editingPosition && (
              <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content position-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Position</h3>
                    <button className="modal-close" onClick={handleCloseModal}>×</button>
                  </div>
                  <form onSubmit={handleUpdatePosition}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label htmlFor="edit_job_title">
                          Job Title <span className="required">*</span>
                        </label>
                        <input
                          id="edit_job_title"
                          name="job_title"
                          type="text"
                          value={formData.job_title}
                          onChange={handleInputChange}
                          placeholder="e.g., Software Engineer, Customer Service Representative"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit_job_description">Job Description</label>
                        <textarea
                          id="edit_job_description"
                          name="job_description"
                          value={formData.job_description}
                          onChange={handleInputChange}
                          placeholder="Enter job description..."
                          rows={6}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={handleCloseModal}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="button-primary"
                        disabled={submitting || !formData.job_title.trim()}
                      >
                        {submitting ? 'Updating...' : 'Update Position'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

