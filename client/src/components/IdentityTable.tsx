export function IdentityTable() {
  const fields = [
    { label: "Persil", placeholder: "____________________________________" },
    { label: "Lokasi", placeholder: "____________________________________" },
    { label: "Pemilik", placeholder: "____________________________________" },
    { label: "Alamat", placeholder: "____________________________________" },
    { label: "Titik Koordinat", placeholder: "____________________________________" },
  ];

  const rightFields = [
    { label: "Instalasi", placeholder: "____________________________________" },
    { label: "Penyambungan Daya", placeholder: "____________________________________" },
    { label: "Daya Terpasang", placeholder: "____________________________________" },
    { label: "Tahun Operasi", placeholder: "____________________________________" },
    { label: "Wilayah Kerja", placeholder: "____________________________________" },
  ];

  return (
    <div className="border-x border-b border-slate-900">
      <div className="grid grid-cols-2">
        <div className="border-r border-slate-900 p-1">
          <table className="w-full text-[10px] border-collapse">
            <tbody>
              {fields.map((field) => (
                <tr key={field.label}>
                  <td className="w-24 font-bold text-slate-900 py-0.5">{field.label}</td>
                  <td className="w-2 text-center text-slate-900">:</td>
                  <td className="text-slate-900 px-1 truncate">
                    <span className="opacity-40">Input Value</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-1">
          <table className="w-full text-[10px] border-collapse">
            <tbody>
              {rightFields.map((field) => (
                <tr key={field.label}>
                  <td className="w-28 font-bold text-slate-900 py-0.5">{field.label}</td>
                  <td className="w-2 text-center text-slate-900">:</td>
                  <td className="text-slate-900 px-1 truncate">
                    <span className="opacity-40">Input Value</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
