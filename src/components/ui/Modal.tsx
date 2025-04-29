import React from "react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [report, setReport] = React.useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-lg font-bold mb-2">Relatar ocorrência no atendimento</h2>
        <p className="text-sm text-gray-500 mb-4">
          Houve algum <strong>problema</strong> no atendimento? Conte para a gente.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          rows={4}
          placeholder="Descreva o ocorrido..."
          value={report}
          onChange={(e) => setReport(e.target.value)}
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSubmit(report);
              onClose();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;