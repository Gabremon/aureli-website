import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeePipeline.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Applicant {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  status: string;
  stage_order: number;
  notes?: string;
  applied_date: string;
  created_at: string;
  updated_at: string;
}

const PIPELINE_STAGES = [
  { id: 'new_applicant', label: 'New Applicants', color: '#3b82f6' },
  { id: 'screening', label: 'Screening', color: '#8b5cf6' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', color: '#f59e0b' },
  { id: 'interview_complete', label: 'Interview Complete', color: '#10b981' },
  { id: 'offer_extended', label: 'Offer Extended', color: '#06b6d4' },
  { id: 'offer_accepted', label: 'Offer Accepted', color: '#14b8a6' },
  { id: 'onboarding', label: 'Onboarding', color: '#6366f1' },
  { id: 'active_employee', label: 'Active Employees', color: '#22c55e' },
  { id: 'offboarding', label: 'Offboarding', color: '#ef4444' },
  { id: 'archived', label: 'Archived', color: '#6b7280' },
];

interface OpeningPipelineProps {
  openingId: number;
  openingTitle: string;
}

export default function OpeningPipeline({ openingId, openingTitle }: OpeningPipelineProps) {
  const { token } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedApplicant, setDraggedApplicant] = useState<Applicant | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, [openingId, token]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/business/openings/${openingId}/applicants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Even if there's an error, show empty pipeline instead of error message
        console.error('Failed to fetch applicants:', response.statusText);
        setApplicants([]);
        return;
      }

      const data = await response.json();
      setApplicants(data.applicants || []);
    } catch (err) {
      // Even if there's an error, show empty pipeline instead of error message
      console.error('Error fetching applicants:', err);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, applicant: Applicant) => {
    setDraggedApplicant(applicant);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', applicant.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    if (!draggedApplicant || draggedApplicant.status === targetStatus) {
      setDraggedApplicant(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees/${draggedApplicant.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update applicant status');
      }

      // Refresh applicants list
      await fetchApplicants();
    } catch (err) {
      console.error('Error updating applicant status:', err);
      alert('Failed to move applicant. Please try again.');
    } finally {
      setDraggedApplicant(null);
    }
  };

  const getApplicantsByStatus = (status: string) => {
    return applicants
      .filter(app => app.status === status)
      .sort((a, b) => a.stage_order - b.stage_order);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="employee-pipeline" style={{ position: 'relative' }}>
      {loading && (
        <div className="pipeline-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading applicants...</p>
        </div>
      )}
      
      <div className="pipeline-header">
        <div>
          <h2 className="pipeline-title">Applicant Pipeline</h2>
          <p className="pipeline-subtitle">Move applicants through the hiring stages for {openingTitle}</p>
        </div>
      </div>

      <div className="pipeline-board">
        {PIPELINE_STAGES.map((stage) => {
          const stageApplicants = getApplicantsByStatus(stage.id);
          return (
            <div
              key={stage.id}
              className="pipeline-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="column-header" style={{ borderTopColor: stage.color }}>
                <h3 className="column-title">{stage.label}</h3>
                <span className="column-count">{stageApplicants.length}</span>
              </div>
              <div className="column-content">
                {stageApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="employee-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, applicant)}
                    onClick={() => setSelectedApplicant(applicant)}
                  >
                    <div className="employee-card-header">
                      <h4 className="employee-name">
                        {applicant.first_name} {applicant.last_name}
                      </h4>
                    </div>
                    {applicant.position && (
                      <p className="employee-position">{applicant.position}</p>
                    )}
                    {applicant.email && (
                      <p className="employee-email">{applicant.email}</p>
                    )}
                    <div className="employee-meta">
                      <span className="employee-date">Applied: {formatDate(applicant.applied_date)}</span>
                    </div>
                  </div>
                ))}
                {stageApplicants.length === 0 && (
                  <div className="empty-column">
                    <p>No applicants in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Applicant Details</h3>
              <button className="modal-close" onClick={() => setSelectedApplicant(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <p>{selectedApplicant.first_name} {selectedApplicant.last_name}</p>
              </div>
              {selectedApplicant.email && (
                <div className="form-group">
                  <label>Email</label>
                  <p>{selectedApplicant.email}</p>
                </div>
              )}
              {selectedApplicant.phone && (
                <div className="form-group">
                  <label>Phone</label>
                  <p>{selectedApplicant.phone}</p>
                </div>
              )}
              {selectedApplicant.position && (
                <div className="form-group">
                  <label>Position</label>
                  <p>{selectedApplicant.position}</p>
                </div>
              )}
              <div className="form-group">
                <label>Status</label>
                <p>{PIPELINE_STAGES.find(s => s.id === selectedApplicant.status)?.label || selectedApplicant.status}</p>
              </div>
              <div className="form-group">
                <label>Applied Date</label>
                <p>{formatDate(selectedApplicant.applied_date)}</p>
              </div>
              {selectedApplicant.notes && (
                <div className="form-group">
                  <label>Notes</label>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplicant.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setSelectedApplicant(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

