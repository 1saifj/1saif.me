import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  RotateCcw, 
  Play, 
  MapPin, 
  TrendingUp,
  Eye,
  BarChart3,
  Bookmark,
  ArrowUp,
  Timer,
  Target,
  // Enhanced icons
  Zap,
  Award,
  Focus,
  Brain,
  Coffee,
  Sparkles,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useProgressiveReading, UseProgressiveReadingOptions } from '../hooks/useProgressiveReading';

interface ProgressiveReadingProps extends UseProgressiveReadingOptions {
  className?: string;
  showDetailedStats?: boolean;
  showFloatingProgress?: boolean;
  showReadingResume?: boolean;
  // Enhanced props
  showAchievements?: boolean;
  showReadingInsights?: boolean;
  enableFocusMode?: boolean;
}

export const ProgressiveReading: React.FC<ProgressiveReadingProps> = ({
  articleSlug,
  content,
  className = '',
  showDetailedStats = true,
  showFloatingProgress = true,
  showReadingResume = true,
  showAchievements = true,
  showReadingInsights = true,
  enableFocusMode = true,
  ...options
}) => {
  const {
    progress,
    session,
    jumpToSavedPosition,
    markCompleted,
    resetProgress,
    getAchievementInfo,
    getReadingInsights,
    getReadingSpeedDescription
  } = useProgressiveReading({ articleSlug, content, ...options });

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null);

  // Show resume prompt if user has significant progress
  useEffect(() => {
    if (showReadingResume && progress.percentage > 10 && progress.percentage < 95 && !session.completed) {
      const timer = setTimeout(() => setShowResumePrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress.percentage, session.completed, showReadingResume]);
  
  // Milestone celebration effect
  useEffect(() => {
    const milestones = [25, 50, 75, 90, 100];
    const currentMilestone = milestones.find(m => 
      progress.percentage >= m && !session.milestoneCelebrations.includes(m)
    );
    
    if (currentMilestone) {
      setCelebratingMilestone(currentMilestone);
      // Add to celebrated milestones
      session.milestoneCelebrations.push(currentMilestone);
      
      // Auto-hide celebration after 3 seconds
      setTimeout(() => setCelebratingMilestone(null), 3000);
    }
  }, [progress.percentage, session.milestoneCelebrations]);
  
  // Focus mode effect
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    
    return () => document.body.classList.remove('focus-mode');
  }, [focusMode]);

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
    if (progress.percentage >= 95) return 'from-emerald-500 via-green-500 to-emerald-600';
    if (progress.percentage >= 75) return 'from-blue-500 via-cyan-500 to-blue-600';
    if (progress.percentage >= 50) return 'from-purple-500 via-violet-500 to-purple-600';
    if (progress.percentage >= 25) return 'from-orange-500 via-amber-500 to-orange-600';
    return 'from-slate-400 via-slate-500 to-slate-600';
  };

  const getProgressGlow = () => {
    if (progress.percentage >= 95) return 'shadow-lg shadow-emerald-500/30';
    if (progress.percentage >= 75) return 'shadow-lg shadow-blue-500/30';
    if (progress.percentage >= 50) return 'shadow-lg shadow-purple-500/30';
    if (progress.percentage >= 25) return 'shadow-lg shadow-orange-500/30';
    return 'shadow-sm shadow-slate-400/20';
  };

  return (
    <>
      {/* Enhanced Floating Progress Bar */}
      {showFloatingProgress && (
        <div className="fixed top-0 left-0 right-0 z-50">
          {/* Background track */}
          <div className="h-1 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-sm">
            {/* Main progress bar with enhanced animations */}
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} ${getProgressGlow()} relative overflow-hidden transition-all duration-700 ease-out`}
              style={{ width: `${progress.percentage}%` }}
            >
              {/* Animated shine effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                style={{
                  animation: progress.percentage > 0 ? 'shimmer 2s infinite' : 'none'
                }}
              />
              
              {/* Progress indicator dot with pulse */}
              <div className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl border-2 border-current transition-all duration-500 ${
                progress.percentage > 0 ? 'scale-110 animate-pulse' : 'scale-100'
              }`} />
            </div>
            
            {/* Milestone markers */}
            {[10, 25, 50, 75, 90].map((milestone) => (
              <div
                key={milestone}
                className={`absolute top-0 w-0.5 h-full transition-all duration-500 ${
                  progress.percentage >= milestone 
                    ? 'bg-white/60 shadow-sm scale-y-150' 
                    : 'bg-slate-400/40 scale-y-100'
                }`}
                style={{ left: `${milestone}%` }}
              >
                {/* Milestone indicator */}
                {progress.percentage >= milestone && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-bounce" />
                )}
              </div>
            ))}
          </div>
          
          {/* Progress percentage tooltip */}
          {progress.percentage > 0 && (
            <div 
              className="absolute top-2 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-500"
              style={{ 
                left: `${Math.min(Math.max(progress.percentage, 5), 95)}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {Math.round(progress.percentage)}%
              {progress.estimatedTimeRemaining > 0 && (
                <span className="block text-xs opacity-75">
                  {progress.estimatedTimeRemaining}m left
                </span>
              )}
            </div>
          )}
          
          {/* Reading speed badge */}
          {progress.currentReadingSpeed > 0 && (
            <div className="absolute top-2 right-4 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{progress.currentReadingSpeed} WPM</span>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Resume Reading Prompt */}
      {showResumePrompt && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in-scale">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                  Continue Reading
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    {Math.round(progress.percentage)}%
                  </span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  You're making great progress! 
                  {progress.estimatedTimeRemaining > 0 && (
                    <span className="block mt-1 font-medium text-slate-700 dark:text-slate-300">
                      About {progress.estimatedTimeRemaining} min remaining
                    </span>
                  )}
                </p>
                
                {/* Mini progress bar */}
                <div className="mb-4">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      jumpToSavedPosition();
                      setShowResumePrompt(false);
                    }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume</span>
                  </button>
                  
                  <button
                    onClick={() => setShowResumePrompt(false)}
                    className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Later
                  </button>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setShowResumePrompt(false)}
                className="flex-shrink-0 w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowUp className="w-4 h-4 transform rotate-45" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Milestone Celebration */}
      {celebratingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md mx-4 animate-fade-in-scale pointer-events-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Milestone Reached!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You've completed {celebratingMilestone}% of the article!
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setCelebratingMilestone(null)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Achievement Badges Notification */}
      {showAchievements && session.achievements.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 max-w-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Achievements</h4>
            </div>
            <div className="space-y-2">
              {session.achievements.slice(-3).map((achievementId, index) => {
                const achievement = getAchievementInfo(achievementId);
                return (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-lg">{achievement.icon}</span>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">{achievement.title}</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
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
            
            <div className="flex items-center space-x-3">
              {enableFocusMode && (
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    focusMode 
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <Focus className="w-4 h-4" />
                  <span>{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
                </button>
              )}
              
              {session.completed && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span className="font-medium">Reading Progress</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">{Math.round(progress.percentage)}%</span>
                {progress.estimatedTimeRemaining > 0 && (
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {progress.estimatedTimeRemaining}m left
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative h-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              
              {/* Main progress bar */}
              <div
                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressColor()} ${getProgressGlow()} rounded-full transition-all duration-700 ease-out overflow-hidden`}
                style={{ width: `${progress.percentage}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                
                {/* Progress waves */}
                <div className="absolute inset-0 opacity-30">
                  <div className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-12 animate-pulse" />
                </div>
              </div>
              
              {/* Enhanced milestone markers */}
              {[10, 25, 50, 75, 90].map((milestone) => (
                <div
                  key={milestone}
                  className={`absolute top-0 h-full transition-all duration-500 ${
                    progress.percentage >= milestone 
                      ? 'w-1 bg-white/80 shadow-lg scale-y-125' 
                      : 'w-0.5 bg-slate-400/40 scale-y-100'
                  }`}
                  style={{ left: `${milestone}%` }}
                >
                  {/* Milestone completion indicator */}
                  {progress.percentage >= milestone && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-white rounded-full shadow-lg border-2 border-current animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Current position indicator */}
              {progress.percentage > 0 && (
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700"
                  style={{ left: `${progress.percentage}%` }}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-xl border-2 border-current transform -translate-x-1/2 animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Progress milestones text */}
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className={progress.percentage >= 25 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>25%</span>
              <span className={progress.percentage >= 50 ? 'text-purple-600 dark:text-purple-400 font-medium' : ''}>50%</span>
              <span className={progress.percentage >= 75 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>75%</span>
              <span className={progress.percentage >= 90 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>90%</span>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
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
          
          {/* Advanced Reading Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reading Speed</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {progress.currentReadingSpeed || 0} WPM
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Avg: {progress.averageReadingSpeed || 0} WPM
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reading Quality</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {progress.readingQualityScore}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Consistency: {progress.consistencyScore}%
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Focus Level</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {progress.focusLevel}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {progress.focusLevel > 90 ? 'Excellent' : progress.focusLevel > 70 ? 'Good' : 'Average'}
              </div>
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
          
          {/* Reading Insights */}
          {showReadingInsights && getReadingInsights().length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Reading Insights</span>
              </div>
              <div className="space-y-2">
                {getReadingInsights().map((insight, index) => (
                  <p key={index} className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {/* Break Suggestion */}
          {session.breakSuggestions.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
              <div className="flex items-center space-x-2 mb-2">
                <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Take a Break</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed mb-3">
                You've been reading for a while. Consider taking a short break to maintain optimal reading performance.
              </p>
              <button className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors">
                Got it
              </button>
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