// src/components/ProductSpecs.jsx
export default function ProductSpecs({ product }) {
  const row = (label, value) => (
    <div className="flex justify-between py-1 border-b border-surface-hard/40 last:border-none">
      <span className="text-neutral-600">{label}</span>
      <span className="font-medium">{value ?? '—'}</span>
    </div>
  )

  const volume =
    product?.volumeMl ? `${Number(product.volumeMl)} ml` : (product?.volume ? String(product.volume) : null)
  const abv =
    product?.abv ? `${Number(product.abv)}%` : null
  const caseUnits =
    product?.caseUnits ? `${Number(product.caseUnits)} u.` : null

  return (
    <div className="rounded-xl2 border border-surface-hard bg-white p-4">
      <h3 className="text-lg font-semibold mb-2">Especificaciones</h3>
      <div className="grid gap-1">
        {row('Marca', product?.brand)}
        {row('Varietal', product?.varietal)}
        {row('Origen', product?.origin)}
        {row('Presentación', volume)}
        {row('Alcohol', abv)}
        {row('Caja', caseUnits)}
        {row('SKU', product?.sku)}
      </div>
    </div>
  )
}
