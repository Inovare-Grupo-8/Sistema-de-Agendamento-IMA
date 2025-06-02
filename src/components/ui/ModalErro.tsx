import React from 'react';

interface ModalErroProps {
  mensagem: string;
  onClose: () => void;
}

const ModalErro: React.FC<ModalErroProps> = ({ mensagem, onClose }) => {
  // Separa as mensagens por ponto final ou quebra de linha
  const mensagens = mensagem.split(/\n|\.|\r/).map(m => m.trim()).filter(Boolean);
  return (
    <div className="modal fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="modal-conteudo relative bg-white rounded-md px-8 py-6 min-w-[260px] max-w-[90vw] flex flex-col items-start border-2 border-orange-500 shadow-lg">
        <button
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600 font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="w-full text-left text-black text-lg font-bold mb-4">Erros:</h2>
        <ul className="text-black text-base pl-2 mb-4 w-full">
          {mensagens.map((msg, idx) => (
            <li key={idx} className="text-left w-full list-none">{msg}</li>
          ))}
        </ul>
        <button className="btn solid bg-[#ED4231] hover:bg-[#c22d1e] text-white font-semibold px-6 py-2 rounded-full self-center mt-2" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default ModalErro;