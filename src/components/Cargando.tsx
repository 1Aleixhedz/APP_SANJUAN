export default function Cargando({ filas = 6 }: { filas?: number }) {
  return (
    <div className="animate-pulse space-y-3 px-4 pt-4">
      <div className="h-6 w-44 rounded-lg bg-lavanda" />
      <div className="h-44 rounded-2xl bg-lavanda" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-20 rounded-xl bg-lavanda" />
        <div className="h-20 rounded-xl bg-lavanda" />
        <div className="h-20 rounded-xl bg-lavanda" />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: filas }).map((_, indice) => (
          <div key={indice} className="h-14 rounded-xl bg-lavanda" />
        ))}
      </div>
    </div>
  );
}
