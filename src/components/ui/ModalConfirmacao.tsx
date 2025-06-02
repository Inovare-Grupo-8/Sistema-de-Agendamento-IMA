import React from 'react';

interface ModalConfirmacaoProps {
  mensagem: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({ mensagem, onConfirm, onCancel }) => {
  return (
    <div className="modal fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="modal-conteudo relative bg-white rounded-md px-8 py-6 min-w-[220px] max-w-[90vw] flex flex-col items-center border-2 border-orange-500 shadow-lg">
        <button
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600 font-bold"
          onClick={onCancel}
          aria-label="Fechar"
        >
          ×
        </button>
        <p className="text-black text-base text-center mb-6">{mensagem}</p>
        <div className="flex gap-4 justify-center">
          <button className="btn solid bg-[#ED4231] hover:bg-[#c22d1e] text-white font-semibold px-6 py-2 rounded-full" onClick={onConfirm}>Sim</button>
          <button className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-full" onClick={onCancel}>Não</button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacao;
