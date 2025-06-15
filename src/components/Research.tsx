import React from 'react'
import { ExternalLink, Calendar, Users, FileText, Link } from 'lucide-react'

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
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
              Research Publication
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto transition-colors duration-300">
              Contributing to machine learning and healthcare technology through research in intelligent fall detection systems
            </p>
          </div>

          {/* Featured Publication */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300">
                  {publication.status}
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300">
                  {publication.type}
                </div>
              </div>
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
                <Calendar className="w-4 h-4 mr-1" />
                {publication.date}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight transition-colors duration-300">
              {publication.title}
            </h3>

            {/* Journal Information */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6 transition-colors duration-300">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Journal: </span>
                  <span className="text-slate-600 dark:text-slate-300">{publication.journal}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Volume: </span>
                  <span className="text-slate-600 dark:text-slate-300">{publication.volume}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Pages: </span>
                  <span className="text-slate-600 dark:text-slate-300">{publication.pages}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">DOI: </span>
                  <span className="text-slate-600 dark:text-slate-300">{publication.doi}</span>
                </div>
              </div>
            </div>

            {/* Authors */}
            <div className="mb-6">
              <div className="flex items-center text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-semibold">Authors:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {publication.authors.map((author, authorIndex) => (
                  <span 
                    key={authorIndex}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                      author === "Saif Aljanahi" 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700" 
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
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center transition-colors duration-300">
                <FileText className="w-4 h-4 mr-2" />
                Abstract:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700 p-4 rounded-lg transition-colors duration-300">
                {publication.abstract}
              </p>
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 transition-colors duration-300">Research Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {publication.keywords.map((keyword, keyIndex) => (
                  <span 
                    key={keyIndex}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-600 transition-colors duration-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                Published in {publication.journal} • {publication.date}
              </div>
              <a
                href={publication.researchGateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Link className="w-4 h-4" />
                <span>View on ResearchGate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}