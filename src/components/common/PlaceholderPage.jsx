export default function PlaceholderPage({ icon, title, description }) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-7">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4 opacity-30">{icon}</div>
        <h3 className="font-display font-semibold text-base text-gray-500 mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">{description}</p>
      </div>
    </div>
  );
}
