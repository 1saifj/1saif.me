import React, { useState, useEffect } from 'react'
import { Users, EnvelopeSimple, Funnel, MagnifyingGlass, DownloadSimple, Trash, Eye, CalendarBlank, Clock } from '@phosphor-icons/react'
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
      `"${c.name}"`, `"${c.email}"`, `"${c.subject}"`, `"${c.message.replace(/"/g, '""')}"`, 
      c.urgency, c.contactMethod, new Date(c.createdAt).toISOString(), c.status
    ])
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50'
      case 'medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
      case 'low': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
      default: return 'bg-slate-50 text-slate-700 dark:bg-zinc-900/40 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800/50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
      case 'read': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50'
      case 'responded': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
      case 'archived': return 'bg-slate-50 text-slate-700 dark:bg-zinc-900/40 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800/50'
      default: return 'bg-slate-50 text-slate-700 dark:bg-zinc-900/40 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800/50'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-[2rem] p-8 md:p-12 w-full max-w-md border border-slate-200/60 dark:border-zinc-800/50 shadow-sm">
          <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-zinc-800">
            <ShieldCheck weight="duotone" className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center tracking-tight">
            Admin Access
          </h1>
          <p className="text-slate-500 dark:text-zinc-500 text-center mb-8">Authenticate to view incoming inquiries.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Master Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-zinc-800/50 transition-all font-mono"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-sm"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] p-6 pb-24">
      <div className="max-w-7xl mx-auto pt-12">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tighter">
              Command Center
            </h1>
            <p className="text-lg text-slate-600 dark:text-zinc-400">
              Manage incoming project inquiries and contact form submissions.
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/50 text-slate-700 dark:text-zinc-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-semibold text-sm"
          >
            <DownloadSimple weight="bold" className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-[2rem] p-6 border border-slate-200/60 dark:border-zinc-800/50 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Total</p>
              <Users weight="duotone" className="w-6 h-6 text-slate-400 dark:text-zinc-600" />
            </div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">{contacts.length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-500 uppercase tracking-wider">New</p>
              <EnvelopeSimple weight="duotone" className="w-6 h-6 text-blue-400 dark:text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tighter">
              {contacts.filter(c => c.status === 'new').length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] p-6 border border-purple-100 dark:border-purple-900/30 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-500 uppercase tracking-wider">Read</p>
              <Eye weight="duotone" className="w-6 h-6 text-purple-400 dark:text-purple-600" />
            </div>
            <p className="text-4xl font-bold text-purple-700 dark:text-purple-400 font-mono tracking-tighter">
              {contacts.filter(c => c.status === 'read').length}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] p-6 border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Responded</p>
              <CalendarBlank weight="duotone" className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
            </div>
            <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-tighter">
              {contacts.filter(c => c.status === 'responded').length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-[2rem] p-6 mb-8 border border-slate-200/60 dark:border-zinc-800/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlass weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-zinc-800/50 transition-all font-medium"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-zinc-800/50 transition-all font-medium appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                  <option value="archived">Archived</option>
                </select>
                <Funnel weight="duotone" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="relative">
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-zinc-800/50 transition-all font-medium appearance-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <Clock weight="duotone" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Table Container */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-zinc-900/40 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Contact</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Subject</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500 dark:text-zinc-500">
                      No records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{contact.name}</p>
                          <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">{contact.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-medium text-slate-700 dark:text-zinc-300 max-w-xs truncate">{contact.subject}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getUrgencyColor(contact.urgency)}`}>
                          {contact.urgency}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact.id, e.target.value as Contact['status'])}
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(contact.status)} focus:outline-none appearance-none cursor-pointer`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-8 py-5 text-sm font-mono text-slate-500 dark:text-zinc-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-lg hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm"
                            title="View Details"
                          >
                            <Eye weight="bold" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-lg hover:border-red-200 dark:hover:border-red-900/50 transition-all shadow-sm"
                            title="Delete Record"
                          >
                            <Trash weight="bold" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 opacity-100 transition-opacity" onClick={() => setSelectedContact(null)}>
            <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] max-w-2xl w-full p-8 md:p-10 border border-slate-200 dark:border-zinc-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{selectedContact.subject}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getUrgencyColor(selectedContact.urgency)}`}>
                      {selectedContact.urgency}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-slate-200/60 dark:border-zinc-800/50">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Sender</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedContact.name}</p>
                  <a href={`mailto:${selectedContact.email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">{selectedContact.email}</a>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Details</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Method: <span className="capitalize">{selectedContact.contactMethod}</span></p>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">Date: {new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mb-10">
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Message Content</p>
                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-sm"
                >
                  <EnvelopeSimple weight="bold" className="w-5 h-5" />
                  Reply via Email
                </a>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="flex-1 px-6 py-4 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
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

const ShieldCheck = (props: any) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <rect width="256" height="256" fill="none" />
      <path d="M208,40H48A16,16,0,0,0,32,56V112c0,61.9,64,104,96,104s96-42.1,96-104V56A16,16,0,0,0,208,40Z" opacity="0.2" />
      <path d="M208,40H48A16,16,0,0,0,32,56V112c0,61.9,64,104,96,104s96-42.1,96-104V56A16,16,0,0,0,208,40Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
      <polyline points="172 96 112 152 84 124" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
    </svg>
  );
}
