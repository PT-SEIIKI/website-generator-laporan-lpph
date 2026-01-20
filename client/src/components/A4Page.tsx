import { ReactNode } from "react";

interface A4PageProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function A4Page({ children, className = "", id }: A4PageProps) {
  return (
    <div className="flex justify-center p-4 bg-muted/30 min-h-screen no-print-padding">
      <div 
        id={id}
        className={`
          a4-page bg-white shadow-xl 
          w-[210mm] min-h-[297mm] h-auto
          mx-auto relative
          text-slate-900
          p-[10mm] flex flex-col
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
