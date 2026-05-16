import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'

export const Research: React.FC = () => {
  const publication = {
    title: "Real-Time classification of various types of falls and activities of daily livings based on CNN LSTM network",
    authors: ["Saif Aljanahi", "Ali H. Ali", "Raed Saleem AL-Musawi", "Yaqeen Sabah Mezaal"],
    journal: "Periodicals of Engineering and Natural Sciences",
    volume: "Vol. 9 (No. 3)",
    pages: "pp. 958-969",
    date: "2021",
    doi: "10.21533/pen.v9i3.2599",
    researchGateUrl: "https://www.researchgate.net/publication/357794309_Real-Time_classification_of_various_types_of_falls_and_activities_of_daily_livings_based_on_CNN_LSTM_network",
    type: "Journal Article",
    abstract: "In this research, two multiclass models have been developed and implemented, namely, a standard long-short-term memory (LSTM) model and a Convolutional neural network (CNN) combined with LSTM (CNN-LSTM) model. Both models operate on raw acceleration data stored in the Sisfall public dataset. These models have been trained using the TensorFlow framework to classify and recognize among ten different events: five separate falls and five activities of daily livings (ADLs). An accuracy of more than 96% has been reached in the first 200 epochs of the training process.",
    keywords: ["Machine Learning", "CNN-LSTM", "Fall Detection", "Healthcare", "Real-time Classification", "TensorFlow"],
    status: "Published"
  }

  return (
    <section id="research" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-200 dark:border-zinc-800">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header Block */}
        <div className="mb-16 border-b border-slate-200 dark:border-zinc-800 pb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
              Academic<br/>
              Research.
            </h2>
            <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-[50ch] leading-relaxed font-medium">
              Contributions to machine learning and healthcare technology algorithms.
            </p>
          </div>
          <a 
             href="https://www.researchgate.net/profile/Saif-Aljanahi" 
             target="_blank"
             rel="noopener noreferrer"
             className="group flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 transition-colors hover:bg-slate-800 dark:hover:bg-slate-200 w-full sm:w-auto"
          >
             <span className="text-[10px] font-bold tracking-[0.2em] uppercase">ResearchGate</span>
             <ArrowUpRight strokeWidth="bold" className="w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Publication Array */}
        <div className="flex flex-col border-t border-l border-slate-200 dark:border-zinc-800">
          <article className="group flex flex-col lg:flex-row border-b border-r border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
            
            {/* Meta Segment */}
            <div className="lg:w-64 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 flex flex-col gap-8 shrink-0">
               <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-2 font-mono">Date Segment</span>
                  <span className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white leading-none">{publication.date}</span>
               </div>
               <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-2 font-mono">Publication Status</span>
                  <span className="text-sm font-bold tracking-wide uppercase text-slate-900 dark:text-white font-mono">[{publication.status}]</span>
               </div>
               <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-2 font-mono">Context</span>
                  <span className="text-sm font-bold tracking-wide uppercase text-slate-900 dark:text-white font-mono">{publication.type}</span>
               </div>
            </div>

            {/* Content Segment */}
            <div className="flex-1 p-8 lg:p-12 flex flex-col">
               <a href={publication.researchGateUrl} target="_blank" rel="noopener noreferrer" className="block mb-8 w-fit group">
                  <h3 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors">
                     {publication.title}
                  </h3>
               </a>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 border-t border-slate-200 dark:border-zinc-800 pt-8">
                  {/* Abstract */}
                  <div className="lg:col-span-8">
                     <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-900 dark:text-white mb-4">Abstract Overview</span>
                     <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                        {publication.abstract}
                     </p>
                  </div>
                  
                  {/* Credit Meta */}
                  <div className="lg:col-span-4 flex flex-col gap-8">
                     <div>
                        <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-900 dark:text-white mb-4">Contributors</span>
                        <div className="flex flex-col gap-2">
                           {publication.authors.map(author => (
                              <span key={author} className={`text-sm ${author === 'Saif Aljanahi' ? 'font-bold uppercase tracking-widest text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-zinc-500'}`}>
                                 {author}
                              </span>
                           ))}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-900 dark:text-white mb-4">Published Registry</span>
                        <span className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                           {publication.journal}
                        </span>
                        <span className="block text-xs uppercase tracking-widest font-mono text-slate-500 dark:text-zinc-500">
                           {publication.volume}, {publication.pages}
                        </span>
                     </div>
                  </div>
               </div>
               
               {/* Tags & Action row */}
               <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-auto gap-6 sm:gap-0 pt-8 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex flex-wrap gap-2">
                     {publication.keywords.map((keyword, idx) => (
                        <span 
                           key={idx}
                           className="px-2 py-1 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-zinc-500"
                        >
                           {keyword}
                        </span>
                     ))}
                  </div>

                  <a 
                     href={publication.researchGateUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white border-b-2 border-transparent hover:border-slate-900 dark:hover:border-white pb-1 transition-all shrink-0"
                  >
                     <span>Access Full Article</span>
                     <ArrowUpRight className="w-3 h-3" />
                  </a>
               </div>
            </div>

          </article>
        </div>

      </div>
    </section>
  )
}
