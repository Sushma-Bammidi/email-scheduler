import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { emailApi } from '../api/emailApi';
import { EmailRecord } from '../types/email';
import { EmailCard } from '../components/EmailCard';
import { Clock, RefreshCw, Search, PlusCircle, Inbox } from 'lucide-react';

export const ScheduledPage: React.FC = () => {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScheduled = async () => {
    setIsRefreshing(true);
    try {
      const data = await emailApi.getScheduledEmails();
      setEmails(data);
    } catch (err) {
      console.error('Failed to fetch scheduled emails', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
    // Auto-poll every 10 seconds to update status as BullMQ jobs finish
    const interval = setInterval(fetchScheduled, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredEmails = emails.filter(
    (e) =>
      e.recipient.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Clock className="w-6 h-6 text-amber-400" />
            Scheduled Queue
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Emails queued in BullMQ awaiting delivery at their configured execution timestamp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchScheduled}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Email
          </Link>
        </div>
      </div>

      {/* Search Input */}
      {emails.length > 0 && (
        <div className="mb-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs transition-all"
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Fetching scheduled emails...</p>
        </div>
      ) : filteredEmails.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Scheduled Emails</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search ? 'No matches found for your search terms.' : 'There are currently no delayed jobs waiting in the queue.'}
            </p>
          </div>
          {!search && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Compose an Email Now
            </Link>
          )}
        </div>
      ) : (
        /* Email Cards List */
        <div className="space-y-4">
          {filteredEmails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      )}
    </div>
  );
};
