import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
         style={{ background: "rgba(3,7,42,.8)", backdropFilter: "blur(6px)" }}>
      <div className="bg-[#13204c] border border-white/10 rounded-xl sm:rounded-2xl w-full max-w-lg shadow-2xl
                      max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-white/5 shrink-0">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose}
            className="text-[#A3AED0] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          {children}
        </div>
      </div>
    </div>
  );
}