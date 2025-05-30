import React from 'react';

interface ModalErroProps {
  mensagem: string;
  onClose: () => void;
}

const ModalErro: React.FC<ModalErroProps> = ({ mensagem, onClose }) => {
  return (
    <div className="modal fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="modal-conteudo relative bg-white rounded-md px-8 py-6 min-w-[220px] max-w-[90vw] flex flex-col items-center">
        <button
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600 font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <p className="text-black text-base text-center">{mensagem}</p>
      </div>
    </div>
  );
};

export default ModalErro;