import { CheckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  isTooltip?: boolean;
  tooltip?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  isTooltip = false,
  tooltip,
  disabled = false,
}) => {
  const [firstLine, secondLine] = tooltip?.split(' | ') || ['', ''];

  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="relative flex items-center justify-center w-5 h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="appearance-none w-5 h-5 border-2 border-gray rounded 
            checked:bg-primary checked:border-primary cursor-pointer
            disabled:cursor-not-allowed disabled:bg-gray/10"
        />
        {checked && (
          <CheckIcon
            className="absolute h-4 w-4 text-white pointer-events-none"
            strokeWidth={2.5}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className={`text-sm text-textDefault select-none leading-5 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {label}
        </label>
        {isTooltip && tooltip && (
          <div className="group relative inline-block">
            <InformationCircleIcon className="h-5 w-5 text-gray hover:text-primary cursor-help" />
            <span
              className="pointer-events-none absolute top-6 right-0
                whitespace-pre-line min-w-[120px] 
                opacity-0 transition-opacity group-hover:opacity-100 
                bg-background text-textDefault text-xs py-1 px-2 
                rounded shadow-lg border border-gray"
            >
              {firstLine}<br/>{secondLine}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkbox;
