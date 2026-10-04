import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Logs() {
  const [tab, setTab] = useState('activity');
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/admin/logs').then((r) => setLogs(r.data));
    api.get('/admin/login-history').then((r) => setHistory(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📜 Security Logs</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('activity')} className={`btn ${tab === 'activity' ? 'btn-primary' : 'btn-ghost'}`}>Activity</button>
        <button onClick={() => setTab('login')} className={`btn ${tab === 'login' ? 'btn-primary' : 'btn-ghost'}`}>Login History</button>
      </div>

      <div className="card">
        {tab === 'activity' ? (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left">
              <tr><th className="pb-3">User</th><th>Action</th><th>Entity</th><th>When</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="py-2">{l.user?.fullName || '-'}</td>
                  <td>{l.action}</td>
                  <td>{l.entityType} #{l.entityId}</td>
                  <td className="text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left">
              <tr><th className="pb-3">User</th><th>IP</th><th>Status</th><th>When</th></tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="py-2">{h.user.fullName}</td>
                  <td className="font-mono text-xs">{h.ipAddress}</td>
                  <td className={h.status === 'success' ? 'text-emerald-600' : 'text-red-600'}>{h.status}</td>
                  <td className="text-slate-400">{new Date(h.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}