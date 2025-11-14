import React, { useState, useEffect } from 'react'
import { BookText, Target, BarChart3, Repeat, Plus, Crown, Sparkles } from 'lucide-react'
import { subscriptionService } from '../lib/subscriptionService'

interface NavBarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  onFabClick?: () => void
  userId?: string
}

const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage, onFabClick, userId }) => {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        const subscription = await subscriptionService.getUserSubscription(userId)
        setIsPro(subscription?.plan?.name === 'Pro')
      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSubscription()
  }, [userId])
  const navItems = [
    { id: 'diary', label: 'Diary', icon: BookText },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Habits', icon: Repeat },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  ]

  const activeIndex = navItems.findIndex(item => item.id === currentPage)

  return (
    <nav className="fixed bottom-4 left-0 right-0 max-w-lg mx-auto h-[88px] z-30 px-4">
      {/* iOS Dock-Style Glass Navigation Bar */}
      <div className="glass-primary h-[72px] flex items-center justify-around px-6 shadow-2xl rounded-[24px] border border-white/20 backdrop-blur-[20px] relative"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
        }}
      >
        {/* Pro Badge or Upgrade Button */}
        {!loading && (
          <div className="absolute -top-2 right-2">
            {isPro ? (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Crown className="w-3 h-3" />
                <span className="text-[9px] font-bold">PRO</span>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('subscription')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <Sparkles className="w-3 h-3" />
                <span className="text-[9px] font-bold">UPGRADE</span>
              </button>
            )}
          </div>
        )}

        {/* Liquid Highlight Indicator */}
        <div 
          className="absolute bottom-[68px] h-[3px] bg-[var(--accent-primary)] liquid-highlight transition-all duration-300 rounded-full"
          style={{
            width: `${100 / navItems.length}%`,
            left: `${(100 / navItems.length) * activeIndex}%`,
            opacity: activeIndex >= 0 ? 1 : 0,
            boxShadow: '0 0 12px var(--accent-primary)'
          }}
        />

        {/* Left Navigation Items */}
        <div className="flex flex-1 justify-around items-center gap-1">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button 
                key={item.id}
                className={`flex flex-col items-center justify-center min-w-[52px] min-h-[52px] rounded-[16px] transition-all duration-300 glass-animation ${
                  isActive ? 'scale-110 bg-white/40' : 'scale-100 opacity-70 hover:opacity-90 hover:bg-white/20'
                }`}
                onClick={() => setCurrentPage(item.id)}
                aria-label={item.label}
                style={{
                  transform: isActive ? 'translateY(-4px) scale(1.1)' : 'translateY(0) scale(1)'
                }}
              >
                <Icon 
                  className="w-7 h-7 mb-0.5" 
                  style={{ 
                    color: isActive ? 'var(--accent-primary)' : 'currentColor',
                    strokeWidth: isActive ? 2.5 : 2,
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'none'
                  }} 
                />
                <span 
                  className="text-[11px] font-bold"
                  style={{ 
                    color: isActive ? 'var(--accent-primary)' : 'currentColor' 
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Spacer for FAB */}
        <div className="w-[76px]"></div>

        {/* Right Navigation Items */}
        <div className="flex flex-1 justify-around items-center gap-1">
          {navItems.slice(2, 4).map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button 
                key={item.id}
                className={`flex flex-col items-center justify-center min-w-[52px] min-h-[52px] rounded-[16px] transition-all duration-300 glass-animation ${
                  isActive ? 'scale-110 bg-white/40' : 'scale-100 opacity-70 hover:opacity-90 hover:bg-white/20'
                }`}
                onClick={() => setCurrentPage(item.id)}
                aria-label={item.label}
                style={{
                  transform: isActive ? 'translateY(-4px) scale(1.1)' : 'translateY(0) scale(1)'
                }}
              >
                <Icon 
                  className="w-7 h-7 mb-0.5" 
                  style={{ 
                    color: isActive ? 'var(--accent-primary)' : 'currentColor',
                    strokeWidth: isActive ? 2.5 : 2,
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'none'
                  }} 
                />
                <span 
                  className="text-[11px] font-bold"
                  style={{ 
                    color: isActive ? 'var(--accent-primary)' : 'currentColor' 
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Floating Action Button (FAB) - iOS Dock Style */}
      <button
        onClick={onFabClick}
        className="absolute left-1/2 -translate-x-1/2 -top-4 w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 fab-pulse"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7C3AED 100%)',
          zIndex: 35,
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
        }}
        aria-label="Add new goal"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={3.5} />
      </button>
    </nav>
  )
}

export default NavBar
