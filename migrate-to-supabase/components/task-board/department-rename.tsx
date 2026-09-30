'use client'

import { useState } from 'react'
import { FolderCog } from 'lucide-react'

type Props = {
  departments: string[]
  onRename: (oldName: string, newName: string) => Promise<boolean>
}

export function DepartmentRename({ departments, onRename }: Props) {
  const [oldDept, setOldDept] = useState('')
  const [newDept, setNewDept] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleRename() {
    setBusy(true)
    const ok = await onRename(oldDept, newDept.trim())
    setBusy(false)
    if (ok) {
      setNewDept('')
      setOldDept('')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
        <FolderCog className="h-5 w-5 text-indigo-600" aria-hidden="true" /> إدارة وتعديل أسماء الأقسام
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        يمكنك إعادة تسمية قسم كامل لتحديث جميع المهام المرتبطة به في النظام فورياً.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          aria-label="القسم المراد تعديله"
          value={oldDept}
          onChange={(e) => setOldDept(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">اختر القسم المراد تعديله...</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          aria-label="اسم القسم الجديد"
          placeholder="اسم القسم الجديد..."
          maxLength={200}
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy}
          onClick={handleRename}
          className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? 'جاري التعديل...' : 'تعديل اسم القسم بالكامل'}
        </button>
      </div>
    </div>
  )
}
