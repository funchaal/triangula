import { Triangle } from 'lucide-react';

export default function LoadingTriangle({ size = 24, className = "" }) {
  // Ajuste do centro de massa visual para o SVG da Lucide
  const visualOriginY = "59%"; 

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <style>{`
        @keyframes spin-3-steps {
          0% { transform: rotate(0deg); }
          /* Primeiro giro: 120 graus */
          25%, 33.33% { transform: rotate(120deg); }
          /* Segundo giro: 240 graus */
          58.33%, 66.66% { transform: rotate(240deg); }
          /* Terceiro giro: volta ao zero (360 graus) */
          91.66%, 100% { transform: rotate(360deg); }
        }
        .animate-triangula-slow {
          /* 2.5s para um movimento bem calmo e elegante */
          animation: spin-3-steps 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      
      <div 
        className="flex items-center justify-center animate-triangula-slow"
        style={{ transformOrigin: `50% ${visualOriginY}` }}
      >
        <Triangle 
          size={size} 
          className="text-white stroke-[2.5] fill-none" 
        />
      </div>
    </div>
  );
}