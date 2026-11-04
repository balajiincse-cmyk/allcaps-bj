import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { resizeImageToDataUrl } from '../data/projects.js';

const EMPTY_FORM = { title: '', summary: '', description: '', features: '', image: '' };

export default function ProjectDialog({ open, project, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(project ? {
      title: project.title ?? '',
      summary: project.summary ?? '',
      description: project.description ?? '',
      features: (project.features ?? []).join('\n'),
      image: project.image ?? '',
    } : EMPTY_FORM);
    setError('');
  }, [open, project]);

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const image = await resizeImageToDataUrl(file);
      setForm((current) => ({ ...current, image }));
      setError('');
    } catch {
      setError('Could not read that image. Please use a PNG or JPG file.');
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    onSave({
      id: project?.id ?? `p-${Date.now().toString(36)}`,
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      features: form.features.split('\n').map((line) => line.trim()).filter(Boolean),
      image: form.image,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{project ? 'Edit project' : 'Add project'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <TextField label="Title" value={form.title} onChange={setField('title')} required fullWidth />
          <TextField label="Summary" value={form.summary} onChange={setField('summary')} helperText="One or two lines shown under the title" fullWidth />
          <TextField label="Description" value={form.description} onChange={setField('description')} multiline minRows={4} fullWidth />
          <TextField
            label="Features"
            value={form.features}
            onChange={setField('features')}
            multiline
            minRows={3}
            helperText="One feature per line"
            fullWidth
          />
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button component="label" variant="outlined">
                {form.image ? 'Replace image' : 'Choose image'}
                <input hidden type="file" accept="image/*" onChange={handleImage} />
              </Button>
              {form.image && (
                <Button color="error" onClick={() => setForm((current) => ({ ...current, image: '' }))}>Remove image</Button>
              )}
            </Stack>
            {form.image && (
              <Box component="img" src={form.image} alt="Project preview" sx={{ mt: 2, maxHeight: 200, maxWidth: '100%', borderRadius: 2 }} />
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
