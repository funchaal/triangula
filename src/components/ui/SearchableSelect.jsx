import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Selecione...", 
  disabled = false,
  inputClassName = "w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  useEffect(() => {
    if (!isOpen) {
      setSearch(selectedOption ? selectedOption.label : '');
    }
  }, [isOpen, selectedOption]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          className={`${inputClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
          placeholder={placeholder}
          value={isOpen ? search : (selectedOption ? selectedOption.label : '')}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && !disabled && (
  <div className="absolute z-[100] w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600">
      <div
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-600 hover:text-white transition-colors ${String(value) === "0" ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'}`}
            onClick={() => { onChange("0"); setIsOpen(false); }}
          >
            -
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">Nenhuma opção encontrada</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-600 hover:text-white transition-colors ${String(opt.value) === String(value) ? 'bg-blue-500/20 text-blue-300' : 'text-slate-200'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}