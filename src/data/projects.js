// Projects are published to public/data/projects.json, so every visitor can read them without a backend.
// Logged-in edits are kept as a draft in this browser until the file is downloaded and committed.
const PUBLISHED_URL = `${import.meta.env.BASE_URL}data/projects.json`;
const DRAFT_KEY = 'allcaps-projects-draft';
const IMAGE_MAX_WIDTH = 900;

export async function fetchPublishedProjects() {
  const response = await fetch(PUBLISHED_URL, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to load projects: ${response.status}`);
  return response.json();
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(projects) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(projects));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function downloadProjectsJson(projects) {
  const blob = new Blob([`${JSON.stringify(projects, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'projects.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Scales the image down and returns it as a JPEG data URL so it can live inside projects.json.
export function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, IMAGE_MAX_WIDTH / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const context = canvas.getContext('2d');
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image'));
    };
    img.src = url;
  });
}
