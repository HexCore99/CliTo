export default function PillInputDark() {
  return (
    <div>
      <label
        htmlFor="name"
        className="ml-px block pl-4 text-sm/6 font-medium text-white"
      >
        Name
      </label>
      <div className="mt-2">
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          className="block w-full rounded-full bg-white/5 px-4 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        />
      </div>
    </div>
  );
}
