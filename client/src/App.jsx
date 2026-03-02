import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Sparkles, Send, CheckCircle, AlertCircle, RefreshCcw, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api/campaign';
const AUTH_BASE = '/api/auth';

const App = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, preview, sending, completed
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(!!localStorage.getItem('google_tokens'));
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Capture tokens from URL after Google OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const tokensParam = params.get('tokens');
    if (tokensParam) {
      try {
        JSON.parse(tokensParam); // Validate JSON
        localStorage.setItem('google_tokens', tokensParam);
        setIsAuthorized(true);
      } catch {
        setErrorMsg('Authentication failed. Please try again.');
      }
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.get(`${AUTH_BASE}/url`);
      window.location.href = res.data.url;
    } catch (err) {
      setErrorMsg('Could not connect to server. Is it running?');
    }
  };

  const handleReset = async () => {
    localStorage.removeItem('google_tokens');
    setIsAuthorized(false);
    setStatus('idle');
    setData(null);
    setReport(null);
    setMessage('');
    setErrorMsg('');
    try { await axios.post(`${API_BASE}/reset`); } catch { }
  };

  const handleAuthError = () => {
    // Clear stale tokens and prompt re-login
    localStorage.removeItem('google_tokens');
    setIsAuthorized(false);
    setStatus('idle');
    setErrorMsg('Your Google session expired. Please log in again.');
  };

  const handlePreview = async () => {
    if (!isAuthorized) return handleLogin();

    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE}/preview`, {
        message,
        tokens: JSON.parse(localStorage.getItem('google_tokens') || '{}')
      });
      setData(res.data);
      setStatus('preview');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === 'NOT_AUTHENTICATED') {
        handleAuthError();
      } else {
        setErrorMsg(errData?.error || err.message || 'Unknown error. Check server logs.');
        setStatus('idle');
      }
    }
  };

  const handleSend = async () => {
    setErrorMsg('');
    try {
      await axios.post(`${API_BASE}/send`, {
        tokens: JSON.parse(localStorage.getItem('google_tokens') || '{}')
      });
      setStatus('sending');
      setReport({ status: 'sending', stats: { total: data.leadsCount, sent: 0, failed: 0 } });
      pollStatus();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === 'NOT_AUTHENTICATED') {
        handleAuthError();
      } else {
        setErrorMsg(errData?.error || err.message);
      }
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status`);
        setReport(res.data);
        if (res.data.status === 'completed') {
          clearInterval(interval);
          setStatus('completed');
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Mail className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Kiran AI Mail</h1>
            <p className="text-slate-500 text-sm">Bulk Personalization Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthorized ? (
            <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-green-100 text-green-700">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Google Connected
            </div>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
              <LogIn className="w-4 h-4" /> Login with Google
            </button>
          )}
          <button onClick={handleReset} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm">
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </header>

      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-sm">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        {(status === 'idle' || status === 'loading') && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary w-5 h-5" />
              <h2 className="text-xl font-bold">New Campaign</h2>
            </div>
            <textarea
              className="input-field min-h-[160px] text-lg"
              placeholder="Enter the message you want to send, e.g. 'Big sale this weekend — 20% off all fruits and vegetables!'"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={handlePreview}
              disabled={!message || status === 'loading'}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze &amp; Preview with AI</>
              )}
            </button>
            {!isAuthorized && (
              <p className="text-center text-amber-600 text-sm font-medium">⚠️ You'll be asked to log in with Google when you click above.</p>
            )}
          </div>
        )}

        {status === 'preview' && data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
              <p className="text-blue-700 text-sm font-medium">AI found <strong>{data.leadsCount}</strong> contacts from your Google Sheet.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">AI Enhanced Subject</h3>
                <div className="bg-white border rounded-xl p-4 font-semibold">{data.preview.subject}</div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Full Template</h3>
                <div className="bg-white border rounded-xl p-4 whitespace-pre-wrap text-slate-700">{data.preview.body}</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sample for {data.sample.name}</h3>
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Mail className="w-20 h-20" /></div>
                  <p className="text-xs opacity-50 mb-4">TO: {data.sample.name?.toLowerCase().replace(' ', '.')}@email.com</p>
                  <p className="font-bold mb-4">SUBJ: {data.preview.subject}</p>
                  <p className="whitespace-pre-wrap leading-relaxed">{data.sample.body}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => { setStatus('idle'); setErrorMsg(''); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-xl font-bold transition-all">Go Back</button>
              <button onClick={handleSend} className="flex-[2] btn-primary flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> Approve &amp; Send Campaign
              </button>
            </div>
          </div>
        )}

        {(status === 'sending' || status === 'completed') && report && (
          <div className="space-y-8 py-4">
            <div className="text-center">
              <AnimatePresence mode="wait">
                {status === 'sending' ? (
                  <motion.div key="sending" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Send className="text-primary w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold">Sending Emails...</h2>
                    <p className="text-slate-500 mt-2">
                      {report.stats.sent + report.stats.failed} of {report.stats.total} processed
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="completed" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-green-500 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold">Campaign Complete! 🎉</h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-6 rounded-2xl text-center border">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">TOTAL</p>
                <p className="text-3xl font-bold">{report.stats.total}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-100">
                <p className="text-green-600 text-xs font-bold uppercase mb-1">SENT</p>
                <p className="text-3xl font-bold text-green-700">{report.stats.sent}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
                <p className="text-red-400 text-xs font-bold uppercase mb-1">FAILED</p>
                <p className="text-3xl font-bold text-red-700">{report.stats.failed}</p>
              </div>
            </div>

            {status === 'completed' && (
              <button onClick={handleReset} className="w-full btn-primary">Start New Campaign</button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default App;
