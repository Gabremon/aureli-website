import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './DatabaseManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TableStats {
  rowCount: number;
  totalSize: string;
  tableSize: string;
  indexesSize: string;
  error?: string;
}

interface DatabaseInfo {
  name: string;
  version: string;
  user: string;
  serverAddress: string;
  serverPort: string;
  size: string;
}

interface DatabaseStats {
  tables: Record<string, TableStats>;
  database: DatabaseInfo;
  timestamp: string;
}

interface TableData {
  table: string;
  actualTableName?: string; // Actual table name in database (may differ from display name)
  columns: Array<{ name: string; type: string; nullable: boolean; default: string | null }>;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DatabaseManagement() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [applicantStats, setApplicantStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'users' | 'applicants'>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  useEffect(() => {
    fetchDatabaseStats();
    fetchUserStats();
    fetchApplicantStats();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, currentPage, sortBy, sortOrder);
    }
  }, [selectedTable, currentPage, sortBy, sortOrder]);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/database/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Failed to fetch database statistics (${response.status})`);
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch database statistics';
      setError(errorMessage);
      console.error('Error fetching database stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string, page: number, sort: string, order: 'ASC' | 'DESC') => {
    try {
      setTableLoading(true);
      const response = await fetch(
        `${API_URL}/api/admin/database/tables/${tableName}?page=${page}&limit=50&sortBy=${sort}&sortOrder=${order}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch table data');
      }

      const data = await response.json();
      setTableData(data);
    } catch (err) {
      console.error('Error fetching table data:', err);
      alert('Failed to fetch table data. Please try again.');
    } finally {
      setTableLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/database/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error(`Failed to fetch user stats: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchApplicantStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/database/employees/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplicantStats(data);
      } else {
        console.error(`Failed to fetch applicant stats: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching applicant stats:', err);
      // If applicants table doesn't exist yet, set empty stats
      setApplicantStats({ byStatus: [], byBusinessOwner: [], recentActivity: [] });
    }
  };

  const handleDeleteRow = async (tableName: string, rowId: number) => {
    if (!confirm(`Are you sure you want to delete this row (ID: ${rowId}) from the ${tableName} table? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(rowId);
      const response = await fetch(`${API_URL}/api/admin/database/tables/${tableName}/rows/${rowId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Failed to delete row (${response.status})`);
      }

      // Refresh table data
      if (selectedTable === tableName) {
        await fetchTableData(tableName, currentPage, sortBy, sortOrder);
      }

      // Refresh stats
      await fetchDatabaseStats();
      if (tableName === 'users') {
        await fetchUserStats();
      } else if (tableName === 'applicants') {
        await fetchApplicantStats();
      }

      alert('Row deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete row';
      alert(`Error: ${errorMessage}`);
      console.error('Error deleting row:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setCurrentPage(1);
    setSortBy('id');
    setSortOrder('ASC');
    setActiveTab('tables');
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) {
      return <span className="null-value">NULL</span>;
    }
    
    if (type.includes('timestamp') || type.includes('date')) {
      return formatDate(value);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className="db-loading">
        <div className="loading-spinner"></div>
        <p>Loading database information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-error">
        <p>Error: {error}</p>
        <button onClick={fetchDatabaseStats} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="database-management">
      <div className="db-header">
        <div>
          <h2 className="db-title">Database Management</h2>
          <p className="db-subtitle">Monitor and manage your database</p>
        </div>
        <button onClick={fetchDatabaseStats} className="refresh-button" title="Refresh">
          🔄 Refresh
        </button>
      </div>

      {stats && (
        <div className="db-info-card">
          <h3>Database Information</h3>
          <div className="db-info-grid">
            <div className="db-info-item">
              <label>Database Name</label>
              <p>{stats.database.name}</p>
            </div>
            <div className="db-info-item">
              <label>Version</label>
              <p className="version-text">{stats.database.version.split(',')[0]}</p>
            </div>
            <div className="db-info-item">
              <label>Current User</label>
              <p>{stats.database.user}</p>
            </div>
            <div className="db-info-item">
              <label>Database Size</label>
              <p className="size-text">{stats.database.size}</p>
            </div>
            <div className="db-info-item">
              <label>Server Address</label>
              <p>{stats.database.serverAddress || 'localhost'}</p>
            </div>
            <div className="db-info-item">
              <label>Last Updated</label>
              <p>{formatDate(stats.timestamp)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="db-tabs">
        <button
          className={`db-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`db-tab ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          Tables
        </button>
        <button
          className={`db-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`db-tab ${activeTab === 'applicants' ? 'active' : ''}`}
          onClick={() => setActiveTab('applicants')}
        >
          Applicants
        </button>
      </div>

      <div className="db-tab-content">
        {activeTab === 'overview' && stats && (
          <div className="overview-tab">
            <h3>Table Statistics</h3>
            <div className="table-stats-grid">
              {Object.entries(stats.tables).map(([tableName, tableStat]) => (
                <div key={tableName} className="table-stat-card" onClick={() => handleTableClick(tableName)}>
                  <div className="table-stat-header">
                    <h4>{tableName}</h4>
                    <span className="table-count-badge">{tableStat.rowCount}</span>
                  </div>
                  <div className="table-stat-details">
                    <div className="stat-detail">
                      <label>Rows:</label>
                      <span>{tableStat.rowCount.toLocaleString()}</span>
                    </div>
                    <div className="stat-detail">
                      <label>Size:</label>
                      <span>{tableStat.tableSize}</span>
                    </div>
                    <div className="stat-detail">
                      <label>Indexes:</label>
                      <span>{tableStat.indexesSize}</span>
                    </div>
                  </div>
                  {tableStat.error && (
                    <div className="stat-error">Error: {tableStat.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="tables-tab">
            <div className="table-selector">
              <h3>Select a Table</h3>
              <div className="table-buttons">
                {stats && Object.keys(stats.tables).map((tableName) => (
                  <button
                    key={tableName}
                    className={`table-button ${selectedTable === tableName ? 'active' : ''}`}
                    onClick={() => handleTableClick(tableName)}
                  >
                    {tableName}
                    <span className="table-button-count">{stats.tables[tableName].rowCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedTable && (
              <div className="table-viewer">
                {tableLoading ? (
                  <div className="table-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading table data...</p>
                  </div>
                ) : tableData ? (
                  <>
                    <div className="table-viewer-header">
                      <h3>{tableData.table}</h3>
                      <div className="table-info">
                        <span>Total Rows: {tableData.pagination.total.toLocaleString()}</span>
                        <span>Page {tableData.pagination.page} of {tableData.pagination.totalPages}</span>
                      </div>
                    </div>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px', cursor: 'default' }}>Actions</th>
                            {tableData.columns.map((column) => (
                              <th
                                key={column.name}
                                onClick={() => handleSort(column.name)}
                                className={sortBy === column.name ? 'sorted' : ''}
                              >
                                {column.name}
                                {sortBy === column.name && (
                                  <span className="sort-indicator">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                                )}
                                <span className="column-type">{column.type}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.data.length === 0 ? (
                            <tr>
                              <td colSpan={tableData.columns.length + 1} className="empty-table">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            tableData.data.map((row, rowIndex) => {
                              // Find the primary key (usually 'id')
                              const primaryKey = row.id || row[tableData.columns.find(c => c.name.toLowerCase() === 'id')?.name || 'id'];
                              return (
                                <tr key={rowIndex} className="data-row">
                                  <td className="row-actions">
                                    <button
                                      className="delete-row-button"
                                      onClick={() => handleDeleteRow(tableData.table, primaryKey)}
                                      disabled={deletingId === primaryKey}
                                      title={`Delete row (ID: ${primaryKey})`}
                                    >
                                      {deletingId === primaryKey ? '...' : '🗑️'}
                                    </button>
                                  </td>
                                  {tableData.columns.map((column) => {
                                    const cellValue = formatValue(row[column.name], column.type);
                                    const displayText = typeof cellValue === 'string' ? cellValue : String(cellValue?.props?.children || cellValue);
                                    return (
                                      <td 
                                        key={column.name} 
                                        className={!column.nullable && !row[column.name] ? 'required-empty' : ''}
                                        title={displayText?.length > 30 ? displayText : undefined}
                                      >
                                        {cellValue}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-pagination">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="pagination-button"
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {tableData.pagination.page} of {tableData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(tableData.pagination.totalPages, p + 1))}
                        disabled={currentPage >= tableData.pagination.totalPages}
                        className="pagination-button"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="table-empty">
                    <p>Select a table to view data</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            {userStats ? (
              <>
                <h3>User Statistics</h3>
                <div className="stats-section">
                  <h4>Users by Role</h4>
                  <div className="stats-grid">
                    {userStats.byRole?.map((stat: any) => (
                      <div key={stat.role} className="stat-card">
                        <div className="stat-value">{stat.count}</div>
                        <div className="stat-label">{stat.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {userStats.recentActivity && userStats.recentActivity.length > 0 && (
                  <div className="stats-section">
                    <h4>Recent User Activity (Last 30 Days)</h4>
                    <div className="activity-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>New Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userStats.recentActivity.map((activity: any, index: number) => (
                            <tr key={index}>
                              <td>{formatDate(activity.date)}</td>
                              <td>{activity.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-state">Loading user statistics...</div>
            )}
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="applicants-tab">
            {applicantStats ? (
              <>
                <h3>Applicant Statistics</h3>
                <div className="stats-section">
                  <h4>Applicants by Status</h4>
                  <div className="stats-grid">
                    {applicantStats.byStatus?.map((stat: any) => (
                      <div key={stat.status} className="stat-card">
                        <div className="stat-value">{stat.count}</div>
                        <div className="stat-label">{stat.status.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {applicantStats.byBusinessOwner && applicantStats.byBusinessOwner.length > 0 && (
                  <div className="stats-section">
                    <h4>Applicants by Business Owner</h4>
                    <div className="activity-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Business Name</th>
                            <th>Email</th>
                            <th>Applicant Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicantStats.byBusinessOwner.map((owner: any, index: number) => (
                            <tr key={index}>
                              <td>{owner.business_name || 'N/A'}</td>
                              <td>{owner.email}</td>
                              <td>{owner.employee_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {applicantStats.recentActivity && applicantStats.recentActivity.length > 0 && (
                  <div className="stats-section">
                    <h4>Recent Applicant Activity (Last 30 Days)</h4>
                    <div className="activity-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>New Applicants</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicantStats.recentActivity.map((activity: any, index: number) => (
                            <tr key={index}>
                              <td>{formatDate(activity.date)}</td>
                              <td>{activity.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-state">Loading applicant statistics...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

