import React from 'react';
import { Menu, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  currentView: 'chat' | 'profile';
  setCurrentView: (view: 'chat' | 'profile') => void;
  onNewChat: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  sessions,
  activeSessionId,
  currentView,
  setCurrentView,
  onNewChat,
  onLoadSession,
  onDeleteSession
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          absolute md:static top-0 bottom-0 left-0 z-30
          flex flex-col h-full bg-neo-yellow dark:bg-[#1a1a1a] shrink-0 border-r-2 border-black dark:border-white
          transition-all duration-300 ease-in-out
          ${isOpen
            ? 'translate-x-0 w-[280px]'
            : '-translate-x-full md:translate-x-0 md:w-[80px]'
          }
        `}
      >
        {/* Menu Toggle */}
        <div
          className={`flex items-center ${isOpen ? 'justify-start px-4 gap-4' : 'justify-center'} h-20 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors group whitespace-nowrap border-b-2 border-black dark:border-white shrink-0`}
          onClick={toggleSidebar}
          title={isOpen ? "Collapse menu" : "Expand menu"}
        >
          <Menu className="w-8 h-8 text-black dark:text-white shrink-0" strokeWidth={2.5} />
          <span className={`font-bold text-xl text-black dark:text-white uppercase tracking-tight ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Menu
          </span>
        </div>

        {/* New Chat Button */}
        <div className={`px-4 mb-6 mt-6 ${!isOpen && 'flex justify-center'}`}>
          <button
            onClick={onNewChat}
            className={`
                flex items-center gap-3 bg-white dark:bg-black text-black dark:text-white transition-all 
                border-2 border-black dark:border-white shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]
                ${isOpen ? 'px-4 py-3 w-full' : 'w-12 h-12 justify-center p-0'}
             `}
            title="New Chat"
          >
            <Plus className="w-6 h-6 shrink-0" strokeWidth={3} />
            <span className={`text-base font-bold uppercase ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              New Chat
            </span>
          </button>
        </div>

        {/* Recent List */}
        <div className={`flex-1 overflow-y-auto space-y-2 custom-scrollbar px-4 pb-4 ${isOpen ? 'opacity-100' : 'opacity-0 hidden pointer-events-none'}`}>
          <div className="text-xs font-black text-black dark:text-white mb-2 uppercase tracking-widest border-b-2 border-black dark:border-white pb-1">Archives</div>

          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onLoadSession(session.id)}
              className={`group flex items-center justify-between px-3 py-2 text-sm cursor-pointer border-2 transition-all
                ${activeSessionId === session.id && currentView === 'chat'
                  ? 'bg-neo-primary border-black dark:border-white text-white font-bold shadow-neo-sm'
                  : 'bg-white dark:bg-transparent border-transparent hover:border-black dark:hover:border-white text-black dark:text-gray-300'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0`} strokeWidth={2.5} />
                <span className="truncate">{session.title}</span>
              </div>

              <button
                onClick={(e) => onDeleteSession(e, session.id)}
                className={`p-1 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black transition-colors opacity-0 group-hover:opacity-100 ${activeSessionId === session.id ? 'opacity-100' : ''
                  }`}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Status */}
        <div className={`mt-auto px-4 py-4 border-t-2 border-black dark:border-white bg-white dark:bg-black ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-black dark:text-white">
            <span className="w-3 h-3 bg-neo-secondary border-2 border-black dark:border-white"></span>
            System Online
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;