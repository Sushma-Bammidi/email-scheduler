import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ComposePage } from './pages/ComposePage';
import { ScheduledPage } from './pages/ScheduledPage';
import { SentPage } from './pages/SentPage';
import { emailApi } from './api/emailApi';
import { StatsResponse } from './types/email';

export const App: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  const fetchStats = async () => {
    try {
      const data = await emailApi.getStats();
      setStats(data);
    } catch (err) {
      // Backend may be offline or initializing
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header stats={stats} />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<ComposePage onScheduledSuccess={fetchStats} />} />
            <Route path="/scheduled" element={<ScheduledPage />} />
            <Route path="/sent" element={<SentPage />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>Email Scheduler MVP &bull; Powered by Node.js, Express, Prisma, PostgreSQL, Redis, BullMQ & Nodemailer</p>
            <p className="text-slate-600">Dynamic Ethereal Mailer Integration Active</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
