import React, { useState } from 'react'
import { Calendar, Clock, Video, Coffee, CheckCircle, ExternalLink } from 'lucide-react'

interface MeetingType {
  id: string
  title: string
  duration: number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export const CalendarBooking: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)

  const meetingTypes: MeetingType[] = [
    {
      id: 'consultation',
      title: 'Free Consultation',
      duration: 30,
      description: 'Discuss your project requirements and see how I can help',
      icon: Coffee,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'technical',
      title: 'Technical Discussion',
      duration: 45,
      description: 'Deep dive into technical architecture and implementation details',
      icon: Video,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'project-review',
      title: 'Project Review',
      duration: 60,
      description: 'Review existing code, architecture, or planning session',
      icon: CheckCircle,
      color: 'from-green-600 to-emerald-600'
    }
  ]

  const handleBookMeeting = (meetingId: string) => {
    // This would typically integrate with Calendly, Cal.com, or similar service
    const calendlyUrl = `https://calendly.com/saif-aljanahi/${meetingId}`
    
    // For demo purposes, we'll show a placeholder
    setSelectedMeeting(meetingId)
    
    // In production, you'd redirect to the actual booking service:
    // window.open(calendlyUrl, '_blank')
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calendar className="w-4 h-4" />
          <span>Schedule a Meeting</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Let's Talk in Person
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Book a free consultation to discuss your project needs and explore how we can work together.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {meetingTypes.map((meeting) => {
          const IconComponent = meeting.icon
          return (
            <div
              key={meeting.id}
              className="group relative p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer"
              onClick={() => handleBookMeeting(meeting.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`bg-gradient-to-r ${meeting.color} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {meeting.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{meeting.duration} min</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {meeting.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Available Mon-Fri, 9 AM - 6 PM (GMT+3)
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedMeeting && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Ready to Schedule!
          </h4>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            To complete the setup, I'll integrate with a calendar booking service like Calendly or Cal.com. 
            For now, please use the contact form above or email me directly.
          </p>
          <button
            onClick={() => setSelectedMeeting(null)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            Close
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          All meetings are conducted via Google Meet or Zoom. You'll receive the meeting link after booking.
        </p>
      </div>
    </div>
  )
} 