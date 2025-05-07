import React from 'react';

interface ModalErroProps {
  mensagem: string;
  onClose: () => void;
}

const ModalErro: React.FC<ModalErroProps> = ({ mensagem, onClose }) => {
  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-conteudo">
        <p>{mensagem}</p>
        <button className="fechar" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ModalErro;