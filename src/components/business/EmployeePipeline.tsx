import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeePipeline.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Employee {
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

export default function EmployeePipeline() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.employees);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, employee: Employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', employee.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    if (!draggedEmployee || draggedEmployee.status === targetStatus) {
      setDraggedEmployee(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees/${draggedEmployee.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee status');
      }

      // Refresh employees list
      await fetchEmployees();
    } catch (err) {
      console.error('Error updating employee status:', err);
      alert('Failed to move employee. Please try again.');
    } finally {
      setDraggedEmployee(null);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name) {
      alert('First name and last name are required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) {
        throw new Error('Failed to create employee');
      }

      setShowAddModal(false);
      setNewEmployee({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        notes: '',
      });
      await fetchEmployees();
    } catch (err) {
      console.error('Error creating employee:', err);
      alert('Failed to create employee. Please try again.');
    }
  };

  const getEmployeesByStatus = (status: string) => {
    return employees
      .filter(emp => emp.status === status)
      .sort((a, b) => a.stage_order - b.stage_order);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pipeline-loading">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pipeline-error">
        <p>Error: {error}</p>
        <button onClick={fetchEmployees} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="employee-pipeline">
      <div className="pipeline-header">
        <div>
          <h2 className="pipeline-title">Employee Pipeline</h2>
          <p className="pipeline-subtitle">Manage your hiring pipeline and move candidates between stages</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="add-employee-button">
          + Add Employee
        </button>
      </div>

      <div className="pipeline-board">
        {PIPELINE_STAGES.map((stage) => {
          const stageEmployees = getEmployeesByStatus(stage.id);
          return (
            <div
              key={stage.id}
              className="pipeline-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="column-header" style={{ borderTopColor: stage.color }}>
                <h3 className="column-title">{stage.label}</h3>
                <span className="column-count">{stageEmployees.length}</span>
              </div>
              <div className="column-content">
                {stageEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="employee-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, employee)}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="employee-card-header">
                      <h4 className="employee-name">
                        {employee.first_name} {employee.last_name}
                      </h4>
                    </div>
                    {employee.position && (
                      <p className="employee-position">{employee.position}</p>
                    )}
                    {employee.email && (
                      <p className="employee-email">{employee.email}</p>
                    )}
                    <div className="employee-meta">
                      <span className="employee-date">Applied: {formatDate(employee.applied_date)}</span>
                    </div>
                  </div>
                ))}
                {stageEmployees.length === 0 && (
                  <div className="empty-column">
                    <p>No employees in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={newEmployee.first_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={newEmployee.last_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newEmployee.notes}
                  onChange={(e) => setNewEmployee({ ...newEmployee, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="button-primary" onClick={handleAddEmployee}>
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-content employee-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button className="modal-close" onClick={() => setSelectedEmployee(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="employee-detail-section">
                <h4>Personal Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <p>{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                  </div>
                  {selectedEmployee.email && (
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{selectedEmployee.email}</p>
                    </div>
                  )}
                  {selectedEmployee.phone && (
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{selectedEmployee.phone}</p>
                    </div>
                  )}
                  {selectedEmployee.position && (
                    <div className="detail-item">
                      <label>Position</label>
                      <p>{selectedEmployee.position}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="employee-detail-section">
                <h4>Pipeline Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Current Stage</label>
                    <p className="status-badge" style={{ 
                      backgroundColor: PIPELINE_STAGES.find(s => s.id === selectedEmployee.status)?.color || '#6b7280' 
                    }}>
                      {PIPELINE_STAGES.find(s => s.id === selectedEmployee.status)?.label || selectedEmployee.status}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Applied Date</label>
                    <p>{formatDate(selectedEmployee.applied_date)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Created</label>
                    <p>{formatDate(selectedEmployee.created_at)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated</label>
                    <p>{formatDate(selectedEmployee.updated_at)}</p>
                  </div>
                </div>
              </div>
              {selectedEmployee.notes && (
                <div className="employee-detail-section">
                  <h4>Notes</h4>
                  <p className="notes-content">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="button-primary" onClick={() => setSelectedEmployee(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

