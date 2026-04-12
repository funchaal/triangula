import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Selecione...", 
  disabled = false,
  // Ajuste nas cores do input e foco
  inputClassName = "w-full bg-[#0B1437] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-[#111C44] transition-all placeholder:text-[#A3AED0]/50"
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A3AED0]">
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[1] w-full mt-2 bg-[#0B1437] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div
            className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-500 hover:text-white transition-colors ${String(value) === "0" ? 'bg-blue-500/20 text-white' : 'text-[#A3AED0]'}`}
            onClick={() => { onChange("0"); setIsOpen(false); }}
          >
            -
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#A3AED0]/50">Nenhuma opção encontrada</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-500 hover:text-white transition-colors ${String(opt.value) === String(value) ? 'bg-blue-500/20 text-white' : 'text-white'}`}
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