import React, { useEffect, useState } from 'react';

interface ModalErroProps {
  mensagem: string;
  onClose: () => void;
}

const ModalErro: React.FC<ModalErroProps> = ({ mensagem, onClose }) => {
  const [contador, setContador] = useState(5);

  useEffect(() => {
    if (contador === 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setContador(contador - 1), 1000);
    return () => clearTimeout(timer);
  }, [contador, onClose]);

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-conteudo">
        <p>{mensagem}</p>
        <p className='font-semibold text-sm'>Fechando em <span>{contador}</span> segundos...</p>
      </div>
    </div>
  );
};

export default ModalErro;