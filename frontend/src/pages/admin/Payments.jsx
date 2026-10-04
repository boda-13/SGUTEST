import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Payments() {
  const [list, setList] = useState([]);
  const load = () => api.get('/admin/payments').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const markPaid = async (id) => { await api.patch(`/admin/payments/${id}/paid`); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💰 Payments</h1>
      <div className="card">
        <table className="w-full">
          <thead className="text-sm text-slate-500 text-left">
            <tr><th className="pb-3">Student</th><th>Type</th><th>Amount</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-3">{p.student.user.fullName}</td>
                <td>{p.type}</td>
                <td>{p.amount} EGP</td>
                <td>{p.status}</td>
                <td>
                  {p.status !== 'paid' && (
                    <button onClick={() => markPaid(p.id)} className="text-emerald-600 text-sm">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}