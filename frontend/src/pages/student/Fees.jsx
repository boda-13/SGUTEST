import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Fees() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/fees').then((r) => setList(r.data)); }, []);

  const colors = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-700',
  };

  const total = list.reduce((s, p) => s + Number(p.amount), 0);
  const pending = list.filter((p) => p.status !== 'paid').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💰 Fees & Payments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-slate-500">Total Billed</div>
          <div className="text-3xl font-bold">{total} EGP</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-500">Outstanding</div>
          <div className="text-3xl font-bold text-red-600">{pending} EGP</div>
        </div>
      </div>

      <div className="card">
        <table className="w-full">
          <thead className="text-sm text-slate-500 text-left">
            <tr><th className="pb-3">Type</th><th>Amount</th><th>Due</th><th>Status</th></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-3">{p.type}</td>
                <td>{p.amount} EGP</td>
                <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</td>
                <td><span className={`px-2 py-1 rounded-lg text-xs ${colors[p.status]}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}