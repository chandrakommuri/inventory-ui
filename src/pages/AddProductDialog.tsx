import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { productCode: string; productDescription: string }) => void;
}

const validationSchema = Yup.object({
  productCode: Yup.string().required('Product Code is required'),
  productDescription: Yup.string().required('Product Description is required'),
});

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>

      <Formik
        initialValues={{ productCode: '', productDescription: '' }}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
          onClose();
        }}
      >
        {({ values, handleChange, touched, errors }) => (
          <Form>
            <DialogContent dividers>
              <TextField
                name="productCode"
                label="Product Code"
                value={values.productCode}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={touched.productCode && Boolean(errors.productCode)}
                helperText={touched.productCode && errors.productCode}
              />

              <TextField
                name="productDescription"
                label="Product Description"
                value={values.productDescription}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={touched.productDescription && Boolean(errors.productDescription)}
                helperText={touched.productDescription && errors.productDescription}
              />
            </DialogContent>

            <DialogActions>
              <Button variant="outlined" onClick={onClose} color="error">
                Cancel
              </Button>
              <Button type="submit" variant="outlined" color="primary">
                Add Product
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddProductDialog;
