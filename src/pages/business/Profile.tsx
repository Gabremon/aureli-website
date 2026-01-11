import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';
import './Profile.css';

interface Business {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { token, user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Format phone number to (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits (US phone number format)
    const limitedDigits = digitsOnly.slice(0, 10);
    
    // Format based on length
    if (limitedDigits.length === 0) {
      return '';
    } else if (limitedDigits.length <= 3) {
      return `(${limitedDigits}`;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/profile`, {
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
        throw new Error(errorData.error || 'Failed to fetch business profile');
      }

      const data = await response.json();
      setBusiness(data.business);
      
      // Format phone number if it exists (in case it's stored unformatted)
      const phoneValue = data.business.phone || '';
      const formattedPhone = phoneValue ? formatPhoneNumber(phoneValue.replace(/\D/g, '')) : '';
      
      // Populate form with existing data
      // Note: email is set from logged-in user, not from business data
      setFormData({
        name: data.business.name || '',
        industry: data.business.industry || '',
        website: data.business.website || '',
        phone: formattedPhone,
        email: user?.email || '', // Use logged-in user's email
        address: data.business.address || '',
        city: data.business.city || '',
        state: data.business.state || '',
        zip_code: data.business.zip_code || '',
        country: data.business.country || 'United States',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business profile');
      console.error('Error fetching business profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number field
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and numbers
    if (
      // Allow control keys
      [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Business name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Prepare update data - convert empty strings to null for optional fields
      const updateData: any = {
        name: formData.name.trim(),
      };

      // Only include non-empty optional fields
      // Note: email is NOT included - it's automatically set from the logged-in user
      if (formData.industry.trim()) updateData.industry = formData.industry.trim();
      if (formData.website.trim()) updateData.website = formData.website.trim();
      // Phone is stored with formatting: (XXX) XXX-XXXX
      if (formData.phone.trim()) updateData.phone = formData.phone.trim();
      if (formData.address.trim()) updateData.address = formData.address.trim();
      if (formData.city.trim()) updateData.city = formData.city.trim();
      if (formData.state.trim()) updateData.state = formData.state.trim();
      if (formData.zip_code.trim()) updateData.zip_code = formData.zip_code.trim();
      if (formData.country.trim()) updateData.country = formData.country.trim();

      const response = await fetch(`${API_URL}/api/business/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business profile');
      }

      const data = await response.json();
      setBusiness(data.business);
      
      // Format phone number if it exists (in case it's stored unformatted)
      const phoneValue = data.business.phone || '';
      const formattedPhone = phoneValue ? formatPhoneNumber(phoneValue.replace(/\D/g, '')) : '';
      
      // Update form data with response
      // Note: email is set from logged-in user, not from business data
      setFormData({
        name: data.business.name || '',
        industry: data.business.industry || '',
        website: data.business.website || '',
        phone: formattedPhone,
        email: user?.email || '', // Use logged-in user's email
        address: data.business.address || '',
        city: data.business.city || '',
        state: data.business.state || '',
        zip_code: data.business.zip_code || '',
        country: data.business.country || 'United States',
      });

      setSuccessMessage('Business profile updated successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business profile');
      console.error('Error updating business profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="profile-container">
              <div className="profile-loading">
                <p>Loading business profile...</p>
              </div>
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
          <div className="profile-container">
            <div className="profile-header">
              <h1 className="profile-title">Business Profile</h1>
              <p className="profile-subtitle">
                Update your business information
              </p>
            </div>

            {error && (
              <div className="profile-error">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="profile-success">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-form-section">
                <h2 className="profile-section-title">Basic Information</h2>
                <div className="profile-form-section-content">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="name">
                      Business Name <span className="required">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Retail, Healthcare"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h2 className="profile-section-title">Contact Information</h2>
                <div className="profile-form-section-content">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      disabled
                      className="form-input-readonly"
                      placeholder="business@example.com"
                      title="Email is set from your account and cannot be changed"
                    />
                    <small className="form-help-text">
                      Set from your account
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onKeyDown={handlePhoneKeyDown}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h2 className="profile-section-title">Address</h2>
                <div className="profile-form-section-content full-width">
                  <div className="form-group">
                    <label htmlFor="address">Street Address</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="zip_code">ZIP Code</label>
                      <input
                        id="zip_code"
                        name="zip_code"
                        type="text"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="button-primary"
                  disabled={saving || !formData.name.trim()}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={fetchBusinessProfile}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

