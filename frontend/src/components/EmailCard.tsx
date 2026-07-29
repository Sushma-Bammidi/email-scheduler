import React, { useState, useEffect } from 'react';
import { EmailRecord } from '../types/email';
import { StatusBadge } from './StatusBadge';
import { Calendar, ExternalLink, Mail, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface EmailCardProps {
  email: EmailRecord;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (email.status !== 'SCHEDULED') return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(email.scheduledAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Due now / Processing...');
        return;
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      let str = '';
      if (days > 0) str += `${days}d `;
      if (hours > 0 || days > 0) str += `${hours}h `;
      str += `${minutes}m ${seconds}s`;

      setTimeLeft(str);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [email.scheduledAt, email.status]);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              {email.recipient}
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate max-w-md">{email.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <StatusBadge status={email.status} />
          {email.etherealPreviewUrl && (
            <a
              href={email.etherealPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white transition-all shadow-sm"
              title="View sent email rendering in Ethereal Sandbox"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Email
            </a>
          )}
        </div>
      </div>

      {/* Details Row */}
      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Scheduled:</span>
          <span className="font-semibold text-slate-200">{formatDate(email.scheduledAt)}</span>
        </div>

        {email.status === 'SCHEDULED' && timeLeft && (
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Sends in: {timeLeft}</span>
          </div>
        )}

        {email.sentAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sent At:</span>
            <span className="font-semibold text-emerald-300">{formatDate(email.sentAt)}</span>
          </div>
        )}
      </div>

      {/* Failure Error Display */}
      {email.status === 'FAILED' && email.error && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Execution Error: </span>
            <span>{email.error}</span>
          </div>
        </div>
      )}

      {/* Expandable Body */}
      <div className="mt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors focus:outline-none"
        >
          {isExpanded ? (
            <>
              Hide Email Body <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              View Email Body <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {email.body}
          </div>
        )}
      </div>
    </div>
  );
};
