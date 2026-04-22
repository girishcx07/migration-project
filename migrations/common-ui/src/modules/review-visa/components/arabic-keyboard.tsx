import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Trash2, X } from "lucide-react";
import React, { useState } from "react";

// Type definitions

interface ArabicKeyboardProps {
  setArabicInput: (value: string) => void;
  setPopover: (isOpen: false) => void;
  input?: string;
  name?: string;
  label?: string;
  isRequiredField: boolean;
}

// Arabic keyboard layout
const ARABIC_KEYBOARD_LAYOUT = [
  ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"],
];

const ArabicKeyboard: React.FC<ArabicKeyboardProps> = ({
  name,
  input = "",
  setArabicInput,
  setPopover,
  label,
  isRequiredField,
}) => {
  const [currentInput, setCurrentInput] = useState(input);

  // Strict Arabic character validation
  const isValidArabicInput = (text: string): boolean =>
    /^[\u0600-\u06FF\u0660-\u0669\s]*$/.test(text);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidArabicInput(value)) {
      setCurrentInput(value);
      setArabicInput(value);
    }
  };

  const handleKeyboardInput = (key: string) => {
    let newInput = currentInput;

    if (key === "{bksp}") {
      newInput = newInput.slice(0, -1);
    } else if (key === "{clear}") {
      newInput = "";
    } else if (key === "{space}") {
      newInput += " ";
    } else {
      newInput += key;
    }

    if (isValidArabicInput(newInput)) {
      setCurrentInput(newInput);
      setArabicInput(newInput);
    }
  };

  const renderKeyboardRow = (row: string[]) => (
    <div key={row.join("")} className="flex justify-center space-x-1 mb-1">
      {row.map((key) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          onClick={() => handleKeyboardInput(key)}
          className="w-8 h-8 p-0 text-sm"
        >
          {key}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-md">
      <div className="">
        <div className="flex items-center mb-2">
          <label htmlFor={name} className="mr-2 text-sm font-medium">
            {label}
            {isRequiredField && <span className="text-red-500">*</span>}
          </label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPopover(false)}
            className="ml-auto h-[25px] w-[25px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Input
          id={name}
          value={currentInput}
          placeholder="أدخل النص باللغة العربية"
          onChange={handleInputChange}
          className="mb-2 text-right"
        />
        <div className="space-y-1">
          {ARABIC_KEYBOARD_LAYOUT.map(renderKeyboardRow)}
          <div className="flex justify-center space-x-1 mb-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleKeyboardInput("{bksp}")}
              className="w-16 text-sm"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleKeyboardInput("{space}")}
              className="w-32 text-sm"
            >
              Space
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleKeyboardInput("{clear}")}
              className="w-16 text-sm flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              مسح
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicKeyboard;
