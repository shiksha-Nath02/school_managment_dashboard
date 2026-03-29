import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', linkTo = '/' }) {
  const sizes = {
    small: { box: 'w-7 h-7 text-sm', text: 'text-lg' },
    default: { box: 'w-9 h-9 text-base', text: 'text-xl' },
  };

  const s = sizes[size] || sizes.default;

  return (
    <Link to={linkTo} className="flex items-center gap-2.5 no-underline">
      <div
        className={`${s.box} bg-brand-500 rounded-[10px] flex items-center justify-center text-white font-bold`}
      >
        S
      </div>
      <span className={`font-display font-extrabold ${s.text} text-gray-900 tracking-tight`}>
        SchoolDesk
      </span>
    </Link>
  );
}
