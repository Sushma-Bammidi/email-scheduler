import React, { useEffect, useState } from 'react';
import { emailApi } from '../api/emailApi';
import { EmailRecord } from '../types/email';
import { EmailCard } from '../components/EmailCard';
import { CheckCheck, RefreshCw, Search, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SentPage: React.FC = () => {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSent = async () => {
    setIsRefreshing(true);
    try {
      const data = await emailApi.getSentEmails();
      setEmails(data);
    } catch (err) {
      console.error('Failed to fetch sent emails', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSent();
    const interval = setInterval(fetchSent, 10000);
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
            <CheckCheck className="w-6 h-6 text-emerald-400" />
            Sent & Dispatched Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Historical record of all emails processed by the BullMQ worker, with live Ethereal sandbox rendering links.
          </p>
        </div>

        <button
          onClick={fetchSent}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          Refresh Log
        </button>
      </div>

      {/* Search Input */}
      {emails.length > 0 && (
        <div className="mb-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sent emails by recipient or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs transition-all"
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Fetching sent email logs...</p>
        </div>
      ) : filteredEmails.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Sent Emails Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search ? 'No matches found.' : 'Emails will appear here once scheduled jobs reach their delivery time.'}
            </p>
          </div>
          {!search && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Compose & Schedule First Email
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
