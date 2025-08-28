import React from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import api from '../Api';
import { Option } from "../models/Option";

interface AddableAutocompleteProps {
  value: Option | null;
  onChange: (value: Option | null) => void;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  createUrl: string;
  label?: string;
  error?: boolean;
  helperText?: React.ReactNode;
}

const AddableAutocomplete: React.FC<AddableAutocompleteProps> = ({
  value,
  onChange,
  options,
  setOptions,
  createUrl,
  label = 'Select',
  error,
  helperText,
}) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <Autocomplete
      freeSolo
      value={value}
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        if (option.inputValue) return option.inputValue;
        return option.name;
      }}
      filterOptions={(opts, { inputValue }) => {
        let filtered = opts.filter((opt) =>
          opt.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (
          inputValue !== '' &&
          !opts.some((opt) => opt.name.toLowerCase() === inputValue.toLowerCase())
        ) {
          filtered.push({
              name: inputValue,
              inputValue: inputValue,
              isNew: true
          });
        }
        return filtered;
      }}
      renderOption={(props, option) => (
        <li {...props}>
          {option.isNew ? `➕ Add "${option.name}"` : option.name}
        </li>
      )}
      onChange={async (event, newValue) => {
        if (newValue && typeof newValue !== 'string' && (newValue as Option).isNew) {
          setLoading(true);
          try {
            const resp = await api.post(
              createUrl,
              { name: newValue.inputValue },
              { headers: { 'Content-Type': 'application/json' } }
            );
            const newItem = {
              id: resp.data.id,
              name: newValue.inputValue!,
            };
            setOptions((prev) => [...prev, newItem]);
            onChange(newItem);
          } catch (err) {
            console.error(`Error adding new entry to ${createUrl}:`, err);
          } finally {
            setLoading(false);
          }
        }else if (typeof newValue === 'string') {
            onChange({ name: newValue });
        } else {
            onChange(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          margin="normal"
          error={error}
          helperText={helperText}
          onChange={(e) => {
            const upper = e.target.value.toUpperCase();
            params.inputProps.onChange?.({
                ...e,
                target: { ...e.target, value: upper },
            } as any);
          }}
          InputProps={{
            ...params.InputProps,
            style: { textTransform: "uppercase" },
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AddableAutocomplete;
