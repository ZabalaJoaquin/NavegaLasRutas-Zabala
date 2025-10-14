export default function QuantitySelector({ value, onChange }){
  return (
    <div className="inline-flex items-center border border-surface-hard rounded-xl2 overflow-hidden">
      <button className="px-3 py-2" onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <input className="w-12 text-center py-2 outline-none" type="number" min="1" value={value} onChange={e => onChange(parseInt(e.target.value || '1'))} />
      <button className="px-3 py-2" onClick={() => onChange(value + 1)}>＋</button>
    </div>
  )
}
