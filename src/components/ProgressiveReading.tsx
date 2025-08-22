import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  BookOpen, 
  CheckCircle, 
  RotateCcw, 
  Play, 
  Pause, 
  MapPin, 
  TrendingUp,
  Eye,
  BarChart3,
  Bookmark,
  ArrowUp,
  Timer,
  Target
} from 'lucide-react';
import { useProgressiveReading, UseProgressiveReadingOptions } from '../hooks/useProgressiveReading';

interface ProgressiveReadingProps extends UseProgressiveReadingOptions {
  className?: string;
  showDetailedStats?: boolean;
  showFloatingProgress?: boolean;
  showReadingResume?: boolean;
}

export const ProgressiveReading: React.FC<ProgressiveReadingProps> = ({
  articleSlug,
  content,
  className = '',
  showDetailedStats = true,
  showFloatingProgress = true,
  showReadingResume = true,
  ...options
}) => {
  const {
    progress,
    session,
    estimatedReadTime,
    totalWords,
    jumpToSavedPosition,
    markCompleted,
    resetProgress
  } = useProgressiveReading({ articleSlug, content, ...options });

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Show resume prompt if user has significant progress
  useEffect(() => {
    if (showReadingResume && progress.percentage > 10 && progress.percentage < 95 && !session.completed) {
      const timer = setTimeout(() => setShowResumePrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress.percentage, session.completed, showReadingResume]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getReadingSpeedDescription = () => {
    const timeSpentMinutes = progress.timeSpent / 60000;
    const actualWordsPerMinute = timeSpentMinutes > 0 ? progress.wordsRead / timeSpentMinutes : 0;
    
    if (actualWordsPerMinute > 250) return 'Fast reader';
    if (actualWordsPerMinute > 150) return 'Average pace';
    if (actualWordsPerMinute > 0) return 'Careful reader';
    return 'Just started';
  };

  const getProgressColor = () => {
    if (progress.percentage >= 95) return 'from-green-500 to-emerald-600';
    if (progress.percentage >= 75) return 'from-blue-500 to-cyan-600';
    if (progress.percentage >= 50) return 'from-purple-500 to-blue-600';
    if (progress.percentage >= 25) return 'from-orange-500 to-yellow-600';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <>
      {/* Floating Progress Bar */}
      {showFloatingProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 dark:bg-slate-800">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor()} relative overflow-hidden transition-all duration-500 ease-out`}
            style={{ width: `${progress.percentage}%` }}
          >
            {/* Progress indicator dot */}
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-current" />
          </div>
        </div>
      )}

      {/* Resume Reading Prompt */}
      {showResumePrompt && (
        <div className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm animate-fade-in-scale">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Continue Reading
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                You're {Math.round(progress.percentage)}% through this article. 
                {progress.estimatedTimeRemaining > 0 && (
                  <span> About {progress.estimatedTimeRemaining} min remaining.</span>
                )}
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    jumpToSavedPosition();
                    setShowResumePrompt(false);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>
                
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Reading Stats Panel */}
      {showDetailedStats && (
        <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 animate-fade-in-up ${className}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Reading Progress</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{getReadingSpeedDescription()}</p>
              </div>
            </div>
            
            {session.completed && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium text-sm">Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Progress</span>
              <span className="font-semibold">{Math.round(progress.percentage)}%</span>
            </div>
            
            <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${progress.percentage}%` }}
              />
              
              {/* Milestone markers */}
              {[25, 50, 75, 90].map((milestone) => (
                <div
                  key={milestone}
                  className={`absolute top-0 h-full w-px ${
                    progress.percentage >= milestone 
                      ? 'bg-white/50' 
                      : 'bg-slate-400/30'
                  }`}
                  style={{ left: `${milestone}%` }}
                />
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-2 mx-auto">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {formatTime(progress.timeSpent)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Time Spent</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-2 mx-auto">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {progress.wordsRead.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Words Read</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl mb-2 mx-auto">
                <Timer className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {progress.estimatedTimeRemaining}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Min Left</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-2 mx-auto">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {progress.sectionsRead.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Sections</div>
            </div>
          </div>

          {/* Current Section */}
          {progress.currentSection && (
            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Currently Reading</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm leading-relaxed">
                {progress.currentSection}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!session.completed && progress.percentage > 0 && (
              <button
                onClick={jumpToSavedPosition}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Resume Reading</span>
              </button>
            )}

            {progress.percentage >= 95 && !session.completed && (
              <button
                onClick={markCompleted}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Complete</span>
              </button>
            )}

            <button
              onClick={resetProgress}
              className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Session Stats (if revisiting) */}
          {session.revisits > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <TrendingUp className="w-4 h-4" />
                <span>Visit #{session.revisits + 1} • Furthest: {Math.round(session.furthestProgress)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProgressiveReading;