import React, { useState, useEffect } from 'react'
import { Trophy, Award, Target, Flame, Star, Zap, CheckCircle2 } from 'lucide-react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'award' | 'target' | 'flame' | 'star' | 'zap' | 'check'
  earned: boolean
  progress: number
  target: number
  earnedAt?: string
}

interface AchievementSystemProps {
  completedGoals: number
  completedTasks: number
  currentStreak: number
  bestStreak: number
  totalDays: number
}

const iconMap = {
  trophy: Trophy,
  award: Award,
  target: Target,
  flame: Flame,
  star: Star,
  zap: Zap,
  check: CheckCircle2
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  completedGoals,
  completedTasks,
  currentStreak,
  bestStreak,
  totalDays
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const achievementList: Achievement[] = [
      {
        id: 'first-goal',
        title: 'Getting Started',
        description: 'Complete your first goal',
        icon: 'target',
        earned: completedGoals >= 1,
        progress: completedGoals,
        target: 1
      },
      {
        id: 'goal-master',
        title: 'Goal Master',
        description: 'Complete 10 goals',
        icon: 'trophy',
        earned: completedGoals >= 10,
        progress: completedGoals,
        target: 10
      },
      {
        id: 'goal-champion',
        title: 'Goal Champion',
        description: 'Complete 25 goals',
        icon: 'award',
        earned: completedGoals >= 25,
        progress: completedGoals,
        target: 25
      },
      {
        id: 'task-starter',
        title: 'Task Starter',
        description: 'Complete 10 tasks',
        icon: 'check',
        earned: completedTasks >= 10,
        progress: completedTasks,
        target: 10
      },
      {
        id: 'task-warrior',
        title: 'Task Warrior',
        description: 'Complete 50 tasks',
        icon: 'zap',
        earned: completedTasks >= 50,
        progress: completedTasks,
        target: 50
      },
      {
        id: 'task-legend',
        title: 'Task Legend',
        description: 'Complete 100 tasks',
        icon: 'star',
        earned: completedTasks >= 100,
        progress: completedTasks,
        target: 100
      },
      {
        id: 'streak-starter',
        title: 'On Fire',
        description: 'Maintain a 3-day streak',
        icon: 'flame',
        earned: currentStreak >= 3 || bestStreak >= 3,
        progress: Math.max(currentStreak, bestStreak),
        target: 3
      },
      {
        id: 'streak-master',
        title: 'Burning Hot',
        description: 'Maintain a 7-day streak',
        icon: 'flame',
        earned: currentStreak >= 7 || bestStreak >= 7,
        progress: Math.max(currentStreak, bestStreak),
        target: 7
      },
      {
        id: 'streak-legend',
        title: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: 'flame',
        earned: currentStreak >= 30 || bestStreak >= 30,
        progress: Math.max(currentStreak, bestStreak),
        target: 30
      },
      {
        id: 'dedicated',
        title: 'Dedicated',
        description: 'Use the app for 7 days',
        icon: 'star',
        earned: totalDays >= 7,
        progress: totalDays,
        target: 7
      },
      {
        id: 'committed',
        title: 'Committed',
        description: 'Use the app for 30 days',
        icon: 'trophy',
        earned: totalDays >= 30,
        progress: totalDays,
        target: 30
      }
    ]

    setAchievements(achievementList)
  }, [completedGoals, completedTasks, currentStreak, bestStreak, totalDays])

  const earnedCount = achievements.filter(a => a.earned).length
  const totalCount = achievements.length

  return (
    <>
      {/* Achievement Summary Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <Trophy className="w-5 h-5" />
        <span className="font-semibold">
          {earnedCount}/{totalCount} Achievements
        </span>
      </button>

      {/* Achievement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="w-7 h-7" />
                    Achievements
                  </h2>
                  <p className="text-white/90 mt-1">
                    {earnedCount} of {totalCount} unlocked
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const Icon = iconMap[achievement.icon]
                  const progressPercent = Math.min(
                    (achievement.progress / achievement.target) * 100,
                    100
                  )

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        achievement.earned
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-lg ${
                            achievement.earned
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold ${
                              achievement.earned
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {achievement.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              achievement.earned
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-500 dark:text-gray-500'
                            }`}
                          >
                            {achievement.description}
                          </p>

                          {/* Progress Bar for Unearned */}
                          {!achievement.earned && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>
                                  {achievement.progress}/{achievement.target}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Earned Badge */}
                          {achievement.earned && (
                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Unlocked!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AchievementSystem
