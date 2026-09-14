export default function PageHeader({
  title,
  description,
  buttonText,
  onButtonClick
}) {
  return (
    <div className="mb-7 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#151211]">{title}</h1>
        <p className="mt-2 text-sm text-[#6f625f]">{description}</p>
      </div>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="flex items-center gap-2 rounded-xl bg-[#e95345] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d9473a]"
        >
          <span className="text-lg leading-none">+</span>
          {buttonText}
        </button>
      )}
    </div>
  );
}