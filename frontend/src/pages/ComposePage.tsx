import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVUploader } from '../components/CSVUploader';
import { emailApi } from '../api/emailApi';
import { Send, Clock, Calendar, Mail, FileText, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

interface ComposePageProps {
  onScheduledSuccess?: () => void;
}

export const ComposePage: React.FC<ComposePageProps> = ({ onScheduledSuccess }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [manualRecipientsInput, setManualRecipientsInput] = useState('');
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  
  // Default scheduled time: 5 minutes from now in local ISO format (YYYY-MM-THH:mm)
  const getDefaultDateTime = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [scheduledTime, setScheduledTime] = useState(getDefaultDateTime());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Combine manual inputs + CSV emails
  const parseManualEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  };

  const manualEmails = parseManualEmails(manualRecipientsInput);
  const allRecipients = Array.from(new Set([...manualEmails, ...csvEmails].map((e) => e.toLowerCase())));

  // Preset time helpers
  const setQuickTime = (minutesOffset: number) => {
    const d = new Date(Date.now() + minutesOffset * 60 * 1000);
    const tzOffset = d.getTimezoneOffset() * 60000;
    setScheduledTime(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
  };

  const setTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    setScheduledTime(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!subject.trim()) {
      setErrorMsg('Please enter an email subject.');
      return;
    }

    if (!body.trim()) {
      setErrorMsg('Please enter the email body content.');
      return;
    }

    if (allRecipients.length === 0) {
      setErrorMsg('Please provide at least one valid recipient email address (manually or via CSV).');
      return;
    }

    if (!scheduledTime) {
      setErrorMsg('Please select a date and time for scheduling.');
      return;
    }

    setLoading(true);

    try {
      // Convert local time picker value to ISO string with timezone
      const isoScheduledTime = new Date(scheduledTime).toISOString();

      const response = await emailApi.scheduleEmails({
        subject: subject.trim(),
        body: body.trim(),
        recipients: allRecipients,
        scheduledTime: isoScheduledTime,
      });

      setSuccessMsg(`🎉 ${response.message || `Successfully scheduled ${allRecipients.length} email(s)!`}`);
      if (onScheduledSuccess) onScheduledSuccess();

      // Reset Form after delay or navigate
      setTimeout(() => {
        navigate('/scheduled');
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to schedule emails.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
          <Send className="w-6 h-6 text-indigo-400" />
          Compose & Schedule Email
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure subject, body, recipients via manual input or CSV upload, and schedule automatic delayed dispatch via BullMQ & Redis.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl glow-purple border border-slate-800">
        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            Email Subject
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Q3 Product Updates & Release Notes"
            className="w-full px-4 py-3 rounded-xl glass-input text-sm transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Recipients Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-400" />
                Manual Email Recipients
              </label>
              {allRecipients.length > 0 && (
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  Total Recipients: {allRecipients.length}
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={manualRecipientsInput}
              onChange={(e) => setManualRecipientsInput(e.target.value)}
              placeholder="Enter email addresses separated by commas or newlines (e.g. john@example.com, sarah@company.com)..."
              className="w-full px-4 py-3 rounded-xl glass-input text-sm transition-all placeholder:text-slate-500 font-mono text-xs"
            />
          </div>

          {/* CSV File Uploader */}
          <CSVUploader onEmailsExtracted={(emails) => setCsvEmails(emails)} detectedCount={csvEmails.length} />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            Email Content Body
          </label>
          <textarea
            required
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email announcement or newsletter content here..."
            className="w-full px-4 py-3 rounded-xl glass-input text-sm transition-all placeholder:text-slate-500 font-sans leading-relaxed"
          />
        </div>

        {/* Date & Time Picker + Quick Presets */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Schedule Delivery Date & Time
            </label>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setQuickTime(5)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
              >
                +5 Mins
              </button>
              <button
                type="button"
                onClick={() => setQuickTime(60)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={setTomorrowMorning}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
              >
                Tomorrow 9 AM
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="datetime-local"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Scheduling Jobs...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Schedule {allRecipients.length > 0 ? `${allRecipients.length} Email(s)` : 'Email'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
