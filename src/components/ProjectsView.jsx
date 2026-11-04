import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, IconButton, List, ListItemButton, ListItemText, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import PageHeader from './PageHeader.jsx';
import ProjectDialog from './ProjectDialog.jsx';
import { clearDraft, downloadProjectsJson, fetchPublishedProjects, loadDraft, saveDraft } from '../data/projects.js';

const IMAGE_SX = { width: '100%', maxHeight: 360, objectFit: 'contain', bgcolor: '#E2E8F0', borderRadius: 2 };

function TableOfContents({ items, activeId, onSelect }) {
  return (
    <Box sx={{ borderLeft: 1, borderColor: 'divider' }}>
      <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ pl: 2 }}>
        On this page
      </Typography>
      <List dense disablePadding sx={{ mt: 1 }}>
        {items.map((item, index) => (
          <ListItemButton
            key={item.id}
            component="a"
            href={`#project-${item.id}`}
            selected={item.id === activeId}
            onClick={(event) => {
              event.preventDefault();
              onSelect(item.id);
            }}
            sx={{
              pl: 2, py: 0.75, borderLeft: 2, borderRadius: 0,
              borderColor: item.id === activeId ? 'primary.main' : 'transparent',
            }}
          >
            <ListItemText primary={`${String(index + 1).padStart(2, '0')}  ${item.title}`} />
          </ListItemButton>
        ))}
        {!items.length && (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>No projects yet.</Typography>
        )}
      </List>
    </Box>
  );
}

export default function ProjectsView({ user }) {
  const isAdmin = Boolean(user);
  const [projects, setProjects] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    let cancelled = false;
    const draft = isAdmin ? loadDraft() : null;
    setHasDraft(Boolean(draft));
    if (draft) {
      setProjects(draft);
      return undefined;
    }
    fetchPublishedProjects()
      .then((list) => { if (!cancelled) setProjects(list); })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Could not load projects.');
          setProjects([]);
        }
      });
    return () => { cancelled = true; };
  }, [isAdmin]);

  const list = projects ?? [];
  const currentId = list.some((project) => project.id === activeId) ? activeId : list[0]?.id ?? '';

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActiveId(visible.target.id.replace('project-', ''));
    }, { rootMargin: '-120px 0px -60% 0px' });
    (projects ?? []).forEach(({ id }) => {
      const element = document.getElementById(`project-${id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [projects]);

  const updateProjects = (next) => {
    setProjects(next);
    saveDraft(next);
    setHasDraft(true);
  };

  const handleSave = (project) => {
    const exists = list.some((item) => item.id === project.id);
    updateProjects(exists ? list.map((item) => (item.id === project.id ? project : item)) : [...list, project]);
    setDialog(null);
  };

  const handleDelete = (project) => {
    if (window.confirm(`Delete "${project.title}"?`)) {
      updateProjects(list.filter((item) => item.id !== project.id));
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Discard your local draft and reload the published projects?')) return;
    clearDraft();
    setHasDraft(false);
    setLoadError('');
    try {
      setProjects(await fetchPublishedProjects());
    } catch {
      setLoadError('Could not load projects.');
      setProjects([]);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Explore our projects and their features."
        actions={isAdmin ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadProjectsJson(list)} disabled={!projects}>
              Download projects.json
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ project: null })}>
              Add project
            </Button>
          </Stack>
        ) : null}
      />
      {isAdmin && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={hasDraft && <Button color="inherit" size="small" onClick={handleDiscard}>Discard draft</Button>}
        >
          Edits are saved as a draft in this browser only. Visitors see the published list. To publish, download projects.json, replace public/data/projects.json, and push to GitHub.
        </Alert>
      )}
      {loadError && <Alert severity="error" sx={{ mb: 3 }}>{loadError}</Alert>}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', lg: 'row' }, alignItems: 'flex-start', gap: 4 }}>
        <Box component="article" sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {!projects && <CircularProgress />}
          {projects && !list.length && !loadError && (
            <Typography color="text.secondary">No projects have been added yet.</Typography>
          )}
          {list.map((project) => (
            <Card component="section" id={`project-${project.id}`} key={project.id} sx={{ mb: 3, scrollMarginTop: 96 }}>
              <CardContent sx={{ p: 3, overflowWrap: 'anywhere' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="h5" component="h2">{project.title}</Typography>
                    {project.summary && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{project.summary}</Typography>}
                  </Box>
                  {isAdmin && (
                    <Stack direction="row" sx={{ flexShrink: 0 }}>
                      <Tooltip title="Edit">
                        <IconButton aria-label={`Edit ${project.title}`} onClick={() => setDialog({ project })}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton aria-label={`Delete ${project.title}`} onClick={() => handleDelete(project)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Stack>
                {project.image && (
                  <Box component="img" src={project.image} alt={project.title} loading="lazy" sx={{ ...IMAGE_SX, mt: 3 }} />
                )}
                {project.description && (
                  <Typography color="text.secondary" sx={{ mt: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{project.description}</Typography>
                )}
                {project.features?.length > 0 && (
                  <>
                    <Typography variant="h6" component="h3" sx={{ mt: 3 }}>Features</Typography>
                    <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
                      {project.features.map((feature, index) => <Box component="li" key={index} sx={{ mb: 1 }}>{feature}</Box>)}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box component="aside" sx={{ width: { xs: '100%', lg: 260 }, flexShrink: 0, position: { lg: 'sticky' }, top: 32 }}>
          <TableOfContents items={list} activeId={currentId} onSelect={(id) => {
            setActiveId(id);
            document.getElementById(`project-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }} />
        </Box>
      </Box>
      <ProjectDialog
        open={Boolean(dialog)}
        project={dialog?.project ?? null}
        onClose={() => setDialog(null)}
        onSave={handleSave}
      />
    </Box>
  );
}
