'use client';

import { useState } from 'react';
import { X, Plus, Send, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface StaffInvitation {
  id: string;
  phone: string;
  role: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

interface StaffInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffInvitationModal({ isOpen, onClose }: StaffInvitationModalProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'pending'>('invite');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load pending invitations when modal opens
  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/staff/invite', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send invitation
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');

      // Create invitation
      const inviteResponse = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phoneNumber,
          role: 'staff'
        })
      });

      const inviteData = await inviteResponse.json();

      if (!inviteResponse.ok) {
        throw new Error(inviteData.error || 'Failed to create invitation');
      }

      // Send the invitation
      const sendResponse = await fetch('/api/staff/send-invitation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitation_id: inviteData.invitation.id
        })
      });

      const sendData = await sendResponse.json();

      if (!sendResponse.ok) {
        throw new Error(sendData.error || 'Failed to send invitation');
      }

      setMessage({
        type: 'success',
        text: `Invitation sent successfully to ${phoneNumber} via SMS!`
      });
      setPhoneNumber('');

      // Refresh invitations list
      loadInvitations();

      // Switch to pending tab to show the sent invitation
      setActiveTab('pending');

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send invitation'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/staff/invite/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadInvitations(); // Refresh the list
        setMessage({
          type: 'success',
          text: 'Invitation cancelled successfully'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to cancel invitation'
      });
    }
  };

  // Load invitations when switching to pending tab
  const handleTabChange = (tab: 'invite' | 'pending') => {
    setActiveTab(tab);
    if (tab === 'pending') {
      loadInvitations();
    }
  };

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('invite')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'invite'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Invite New Staff
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Pending Invitations
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'invite' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Invite Team Member
              </h3>
              <p className="text-gray-600 mb-6">
                Send an SMS invitation to add a new team member to your restaurant.
              </p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 for US, +91 for India)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="staff">Staff Member</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !phoneNumber.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS Invitation
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pending Invitations
              </h3>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading invitations...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No pending invitations</p>
                  <p className="text-sm text-gray-500">
                    Send your first invitation using the &quot;Invite New Staff&quot; tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        {getStatusIcon(invitation.status)}
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{invitation.phone}</p>
                          <p className="text-sm text-gray-600">
                            Role: {invitation.role} •
                            Created: {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                          {invitation.status === 'pending' && (
                            <p className="text-xs text-gray-500">
                              Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                          {invitation.status}
                        </span>

                        {invitation.status === 'pending' && (
                          <button
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}