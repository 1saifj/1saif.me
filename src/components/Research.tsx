import React from 'react'
import { ExternalLink, Calendar, Users, FileText, Link, BookOpen, Award } from 'lucide-react'

export const Research: React.FC = () => {
  const publication = {
    title: "Real-Time classification of various types of falls and activities of daily livings based on CNN LSTM network",
    authors: ["Saif Aljanahi", "Ali H. Ali", "Raed Saleem AL-Musawi", "Yaqeen Sabah Mezaal"],
    journal: "Periodicals of Engineering and Natural Sciences (PEN)",
    volume: "Vol. 9(No. 3)",
    pages: "pp.958-969",
    date: "September 2021",
    doi: "10.21533/pen.v9i3.2599",
    researchGateUrl: "https://www.researchgate.net/publication/357794309_Real-Time_classification_of_various_types_of_falls_and_activities_of_daily_livings_based_on_CNN_LSTM_network",
    type: "Journal Article",
    abstract: "In this research, two multiclass models have been developed and implemented, namely, a standard long-short-term memory (LSTM) model and a Convolutional neural network (CNN) combined with LSTM (CNN-LSTM) model. Both models operate on raw acceleration data stored in the Sisfall public dataset. These models have been trained using the TensorFlow framework to classify and recognize among ten different events: five separate falls and five activities of daily livings (ADLs). An accuracy of more than 96% has been reached in the first 200 epochs of the training process.",
    keywords: ["Machine Learning", "CNN-LSTM", "Fall Detection", "Healthcare", "Real-time Classification", "TensorFlow", "Raspberry Pi", "Activities of Daily Living"],
    status: "Published"
  }

  return (
    <div className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12 py-8 sm:py-12 lg:py-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-lg">
              <Award className="w-3 sm:w-4 h-3 sm:h-4" />
              <span>Research Publication</span>
            </div>
            <h2 id="research-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight transition-colors duration-300 px-4">
              Academic Research
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300 px-4">
              Contributing to machine learning and healthcare technology through research in intelligent fall detection systems
            </p>
          </div>

          {/* Publication Card */}
          <article className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500">
            {/* Header with Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              <div className="inline-flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                <Award className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span>{publication.status}</span>
              </div>
              <div className="inline-flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                <BookOpen className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span>{publication.type}</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs ml-auto">
                <Calendar className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span className="hidden sm:inline">{publication.date}</span>
                <span className="sm:hidden">Sep 2021</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight transition-colors duration-300">
              {publication.title}
            </h3>

            {/* Journal Information */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 mb-6 transition-colors duration-300 border border-slate-200 dark:border-slate-600">
              <div className="space-y-3">
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Journal</span>
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white font-medium mt-1">{publication.journal}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Volume</span>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white font-medium mt-1">{publication.volume}</p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pages</span>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white font-medium mt-1">{publication.pages}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">DOI</span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono mt-1 break-all">{publication.doi}</p>
                </div>
              </div>
            </div>

            {/* Authors */}
            <div className="mb-6">
              <div className="flex items-center text-slate-900 dark:text-white mb-3 transition-colors duration-300">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                <span className="font-semibold text-sm sm:text-base">Authors</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {publication.authors.map((author, authorIndex) => (
                  <span 
                    key={authorIndex}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-300 ${
                      author === "Saif Aljanahi" 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {author}
                  </span>
                ))}
              </div>
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <div className="flex items-center text-slate-900 dark:text-white mb-3 transition-colors duration-300">
                <FileText className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                <h4 className="font-semibold text-sm sm:text-base">Abstract</h4>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                {publication.abstract}
              </p>
            </div>

            {/* Keywords */}
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 transition-colors duration-300 text-sm sm:text-base">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {publication.keywords.map((keyword, keyIndex) => (
                  <span 
                    key={keyIndex}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <a
                href={publication.researchGateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base flex-1 sm:flex-initial"
              >
                <Link className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>View on ResearchGate</span>
                <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300 text-center sm:text-left">
                Published in {publication.journal} • {publication.date}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
