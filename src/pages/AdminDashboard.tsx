import React, { useState, useEffect } from 'react'
import { Users, Mail, Filter, Search, Download, Trash2, Eye, Calendar, Clock } from 'lucide-react'
import { getAllContacts, updateContactStatus, deleteContact as deleteContactService, Contact } from '../services/contactService'

export const AdminDashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  // Load contacts from Firebase
  useEffect(() => {
    if (isAuthenticated) {
      loadContacts()
    }
  }, [isAuthenticated])

  const loadContacts = async () => {
    try {
      const fetchedContacts = await getAllContacts()
      setContacts(fetchedContacts)
      setFilteredContacts(fetchedContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
      alert('Failed to load contacts')
    }
  }

  useEffect(() => {
    let filtered = contacts

    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(contact => contact.status === filterStatus)
    }

    if (filterUrgency !== 'all') {
      filtered = filtered.filter(contact => contact.urgency === filterUrgency)
    }

    setFilteredContacts(filtered)
  }, [searchQuery, filterStatus, filterUrgency, contacts])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - replace with proper authentication
    if (password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid password')
    }
  }

  const handleStatusChange = async (contactId: string, newStatus: Contact['status']) => {
    try {
      await updateContactStatus(contactId, newStatus)
      setContacts(prev =>
        prev.map(c => c.id === contactId ? { ...c, status: newStatus } : c)
      )
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleDelete = async (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContactService(contactId)
        setContacts(prev => prev.filter(c => c.id !== contactId))
        setSelectedContact(null)
      } catch (error) {
        console.error('Error deleting contact:', error)
        alert('Failed to delete contact')
      }
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Subject', 'Message', 'Urgency', 'Contact Method', 'Created At', 'Status']
    const rows = filteredContacts.map(c => [
      c.name, c.email, c.subject, c.message, c.urgency, c.contactMethod, c.createdAt, c.status
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'read': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'responded': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'archived': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            CRM Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage contact form submissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Contacts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{contacts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">New</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {contacts.filter(c => c.status === 'new').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Read</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {contacts.filter(c => c.status === 'read').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Responded</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {contacts.filter(c => c.status === 'responded').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Urgency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{contact.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{contact.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(contact.urgency)}`}>
                        {contact.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.id, e.target.value as Contact['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)} border-0 focus:outline-none`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="responded">Responded</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setSelectedContact(null)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedContact.subject}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedContact.urgency)}`}>
                      {selectedContact.urgency}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">From</p>
                  <p className="text-slate-900 dark:text-white">{selectedContact.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedContact.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Contact Method</p>
                  <p className="text-slate-900 dark:text-white capitalize">{selectedContact.contactMethod}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date</p>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Message</p>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{selectedContact.message}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => window.location.href = `mailto:${selectedContact.email}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Reply via Email
                </button>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
