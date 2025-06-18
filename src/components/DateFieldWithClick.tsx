import React, { useRef } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const DateFieldWithClick: React.FC<TextFieldProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  return (
    <TextField
      {...props}
      type="date"
      inputRef={inputRef}
      onClick={(e) => {
        props.onClick?.(e);
        handleClick();
      }}
    />
  );
};

export default DateFieldWithClick;
