// Skeleton personalizado para cards de agenda
export function AgendaCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#181A20] rounded-lg border border-[#EDF2FB] dark:border-[#444857] shadow-sm p-4 animate-pulse flex flex-col gap-2">
      <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
      <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

// Skeleton personalizado para formulário de perfil
export function ProfileFormSkeleton() {
  return (
    <div className="bg-white dark:bg-[#23272F] rounded-2xl shadow-lg p-8 animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex flex-col items-center">
        <div className="rounded-full w-40 h-40 bg-gray-200 dark:bg-gray-700 mb-4" />
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// Skeleton personalizado para cards de horários
export function DisponibilizarHorarioSkeleton() {
  return (
    <div className="bg-white dark:bg-[#23272F] rounded-lg border border-[#EDF2FB] dark:border-[#23272F] shadow-sm p-4 animate-pulse flex flex-col gap-2">
      <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
      <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}