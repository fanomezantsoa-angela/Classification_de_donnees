export function Forminput({
  nomlabel,
  typeinput,
  value,
  inputchange,
  isRequired,
  hasPlaceholder,
}) {
  return (
    <>
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {nomlabel}
      </label>
      {/* <br /> */}
      <div className="">
        <input
          className="block bg-white mb-6 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-2 ring-inset ring-inputcolor
            placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-inputcolor sm:text-sm sm:leading-6 px-2 placeholder:text-end"
          placeholder={hasPlaceholder ? hasPlaceholder : null}
          type={typeinput}
          value={value}
          onChange={inputchange}
          required={isRequired ? true : false}
        />
      </div>
    </>
  );
}
