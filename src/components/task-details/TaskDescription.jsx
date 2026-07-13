export default function TaskDescription({ value, onChange }) {
  return (
    <section>
      <label
        htmlFor="task-details-description"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Description
      </label>
      <textarea
        id="task-details-description"
        value={value}
        rows={5}
        placeholder="Add a description..."
        className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
