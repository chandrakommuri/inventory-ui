import { JSX, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
}

export const useConfirmDialog = (): [
  (options: ConfirmOptions) => Promise<boolean>,
  JSX.Element | null
] => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => {});

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setOpen(false);
    resolver(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolver(false);
  };

  const dialog = open ? (
    <ConfirmDialog
      open={open}
      title={options.title}
      message={options.message}
      onYes={handleConfirm}
      onNo={handleCancel}
    />
  ) : null;

  return [confirm, dialog];
};
