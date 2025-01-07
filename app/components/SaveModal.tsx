import { FiDownload, FiImage, FiCalendar } from 'react-icons/fi'
import BaseModal from './BaseModal'

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsPDF: () => void;
  onSaveAsImage: () => void;
  onExportToCalendar: () => void;
  onShareLink: () => void;
}

const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  onSaveAsPDF,
  onSaveAsImage,
  onExportToCalendar,
}) => {
  const options = [
    {
      title: 'Guardar como PDF',
      description: 'Descarga tu horario en formato PDF',
      icon: FiDownload,
      onClick: onSaveAsPDF,
    },
    {
      title: 'Guardar como imagen',
      description: 'Descarga tu horario como imagen PNG',
      icon: FiImage,
      onClick: onSaveAsImage,
    },
    {
      title: 'Exportar a Google Calendar',
      description: 'Sincroniza tu horario con Google Calendar',
      icon: FiCalendar,
      onClick: onExportToCalendar,
    },
    // {
    //   title: 'Compartir enlace',
    //   description: 'Comparte tu horario mediante un enlace',
    //   icon: FiShare2,
    //   onClick: onShareLink,
    // },
  ]

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Guardar horario"
    >
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.title}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondaryBackground transition-colors text-left"
          >
            <option.icon className="w-5 h-5 text-gray" />
            <div>
              <div className="font-medium">{option.title}</div>
              <div className="text-sm text-gray">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </BaseModal>
  )
}

export default SaveModal 