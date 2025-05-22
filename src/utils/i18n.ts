import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      // Textos comuns
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Excluir',
        loading: 'Carregando...',
        goBack: 'Voltar',
        search: 'Buscar',
        confirm: 'Confirmar',
        yes: 'Sim',
        no: 'Não'
      },
      
      // Validações
      validation: {
        required: 'Este campo é obrigatório',
        email: 'Email inválido',
        phone: 'Telefone inválido',
        cep: 'CEP inválido',
        minLength: 'Deve ter pelo menos {{min}} caracteres',
        maxLength: 'Deve ter no máximo {{max}} caracteres'
      },
      
      // Mensagens
      messages: {
        saveSuccess: 'Dados salvos com sucesso!',
        updateSuccess: 'Dados atualizados com sucesso!',
        error: 'Ocorreu um erro. Tente novamente.',
        confirmDelete: 'Tem certeza que deseja excluir?',
        addressFound: 'Endereço encontrado automaticamente',
        cepNotFound: 'CEP não encontrado'
      },
      
      // Páginas
      pages: {
        profile: {
          title: 'Editar Perfil',
          subtitle: 'Atualize suas informações',
          tabs: {
            personal: 'Dados Pessoais',
            address: 'Endereço',
            professional: 'Dados Profissionais',
            photo: 'Foto de Perfil',
            availability: 'Disponibilidade'
          }
        },
        scheduling: {
          title: 'Agendar Consulta',
          subtitle: 'Escolha um horário disponível',
          steps: {
            specialist: 'Escolha um especialista',
            date: 'Escolha uma data',
            time: 'Escolha um horário',
            type: 'Escolha o tipo de consulta',
            confirm: 'Confirme sua consulta'
          }
        }
      }
    }
  },
  en: {
    translation: {
      // Common texts
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        loading: 'Loading...',
        goBack: 'Go Back',
        search: 'Search',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No'
      },
      
      // Validations
      validation: {
        required: 'This field is required',
        email: 'Invalid email',
        phone: 'Invalid phone',
        cep: 'Invalid zip code',
        minLength: 'Must have at least {{min}} characters',
        maxLength: 'Must have at most {{max}} characters'
      },
      
      // Messages
      messages: {
        saveSuccess: 'Data saved successfully!',
        updateSuccess: 'Data updated successfully!',
        error: 'An error occurred. Please try again.',
        confirmDelete: 'Are you sure you want to delete?',
        addressFound: 'Address found automatically',
        cepNotFound: 'Zip code not found'
      },
      
      // Pages
      pages: {
        profile: {
          title: 'Edit Profile',
          subtitle: 'Update your information',
          tabs: {
            personal: 'Personal Data',
            address: 'Address',
            professional: 'Professional Data',
            photo: 'Profile Photo',
            availability: 'Availability'
          }
        },
        scheduling: {
          title: 'Schedule Appointment',
          subtitle: 'Choose an available time slot',
          steps: {
            specialist: 'Choose a specialist',
            date: 'Choose a date',
            time: 'Choose a time',
            type: 'Choose appointment type',
            confirm: 'Confirm your appointment'
          }
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
