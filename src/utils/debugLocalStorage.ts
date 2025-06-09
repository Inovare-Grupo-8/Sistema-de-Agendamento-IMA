// Utilitário de debug temporário para inspecionar localStorage
export const debugLocalStorage = () => {
    console.log('=== DEBUG LOCALSTORAGE ===');
    
    // Listar todas as chaves do localStorage
    console.log('Todas as chaves no localStorage:', Object.keys(localStorage));
    
    // Verificar userData especificamente
    const userData = localStorage.getItem('userData');
    console.log('userData (raw):', userData);
    
    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            console.log('userData (parsed):', parsed);
            console.log('Propriedades do userData:', Object.keys(parsed));
            console.log('idUsuario:', parsed.idUsuario);
            console.log('token:', parsed.token);
            console.log('tipo:', parsed.tipo);
        } catch (error) {
            console.error('Erro ao fazer parse do userData:', error);
        }
    } else {
        console.log('userData não encontrado no localStorage');
    }
    
    // Verificar outras chaves relacionadas
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        console.log('userInfo encontrado:', JSON.parse(userInfo));
    }
    
    console.log('=== FIM DEBUG LOCALSTORAGE ===');
};

// Função para limpar localStorage (útil para testes)
export const clearDebugLocalStorage = () => {
    localStorage.clear();
    console.log('localStorage limpo');
};
