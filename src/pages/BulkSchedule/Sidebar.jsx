import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut } from 'lucide-react';

export function Sidebar({ activeModule, setActiveModule }) {
  return (
    <>
      <div className="p-3 text-center border-bottom border-white border-opacity-10">
        <div className="bg-white rounded p-1 d-inline-block">
           {/* Placeholder for Logo */}
           <div className="text-bob-orange fw-bold" style={{ fontSize: '10px' }}>BOB</div>
        </div>
      </div>

      <nav className="flex-grow-1 d-flex flex-column pt-3">
        <a 
          href="#" 
          className={`sidebar-link ${activeModule === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveModule('dashboard'); }}
        >
          <LayoutDashboard size={20} className="mb-1" />
          <span>Dash</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-link ${activeModule === 'candidates' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveModule('candidates'); }}
        >
          <Users size={20} className="mb-1" />
          <span>Shortlist</span>
        </a>

        <a 
          href="#" 
          className={`sidebar-link ${activeModule === 'interviews' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveModule('interviews'); }}
        >
          <Calendar size={20} className="mb-1" />
          <span>Schedule</span>
        </a>

        <a 
          href="#" 
          className="sidebar-link"
        >
          <FileText size={20} className="mb-1" />
          <span>Reports</span>
        </a>
      </nav>

      <div className="mt-auto pb-3">
        <a href="#" className="sidebar-link">
          <Settings size={20} className="mb-1" />
          <span>Settings</span>
        </a>
        <a href="#" className="sidebar-link">
          <LogOut size={20} className="mb-1" />
          <span>Logout</span>
        </a>
      </div>
    </>
  );
}
