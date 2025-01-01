import { CheckIcon } from "@heroicons/react/24/outline";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-5 h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="appearance-none w-5 h-5 border-2 border-gray rounded 
            checked:bg-primary checked:border-primary cursor-pointer"
        />
        {checked && (
          <CheckIcon 
            className="absolute h-4 w-4 text-white pointer-events-none" 
            strokeWidth={2.5}
          />
        )}
      </div>
      <label 
        htmlFor={id}
        className="text-sm text-textDefault cursor-pointer select-none leading-5"
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox; 