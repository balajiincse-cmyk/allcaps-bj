import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PageHeader from './PageHeader.jsx';

function toProfile(user) {
  const [fallbackFirst = '', ...fallbackRest] = (user?.fullName ?? '').trim().split(/\s+/);
  const firstName = user?.firstName || fallbackFirst;
  return {
    fullName: user?.fullName ?? '',
    firstName,
    lastName: user?.lastName || fallbackRest.join(' '),
    callingName: user?.callingName || firstName,
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    whatsapp: user?.whatsapp || user?.phone || '',
    jobTitle: user?.jobTitle ?? '',
    organization: user?.organization ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
    bio: user?.bio ?? '',
    instagram: user?.instagram ?? '',
    linkedin: user?.linkedin ?? '',
    website: user?.website ?? '',
    photo: user?.photo ?? '',
    coverImage: user?.coverImage ?? '',
  };
}

function makeWebUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
}

function getInstagramUrl(value) {
  const handle = value.trim().replace(/^@/, '');
  if (!handle) return '';
  if (/^[\w.]+$/.test(handle)) return `https://www.instagram.com/${handle}/`;
  try {
    const url = new URL(makeWebUrl(handle));
    return /(^|\.)instagram\.com$/i.test(url.hostname) ? url.toString() : '';
  } catch {
    return '';
  }
}

function getLinkedInUrl(value) {
  if (!value.trim()) return '';
  try {
    const url = new URL(makeWebUrl(value));
    return /(^|\.)linkedin\.com$/i.test(url.hostname) ? url.toString() : '';
  } catch {
    return '';
  }
}

function ProfileLink({ href, icon: Icon, label, value }) {
  if (!href || !value) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ color: 'primary.main', display: 'flex' }}>
        <Icon fontSize="small" />
      </Box>
      <Link href={href} target="_blank" rel="noopener noreferrer" underline="hover" color="inherit" variant="body2">
        {label}
      </Link>
    </Stack>
  );
}

export default function ProfileView({ user }) {
  const profile = toProfile(user);
  const location = [profile.city, profile.country].filter(Boolean).join(', ');
  const whatsappNumber = profile.whatsapp.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber.length >= 8 ? `https://wa.me/${whatsappNumber}` : '';
  const instagramUrl = getInstagramUrl(profile.instagram);
  const linkedinUrl = getLinkedInUrl(profile.linkedin);
  let websiteUrl = '';
  try {
    websiteUrl = makeWebUrl(profile.website);
  } catch {
    websiteUrl = '';
  }

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
      <PageHeader
        eyebrow="Your space"
        title="Profile"
        description="A little introduction, your work, and the best ways to connect."
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.55fr) minmax(280px, 0.9fr)' }, gap: 3 }}>
        <Card sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              height: { xs: 118, sm: 156 },
              background: profile.coverImage
                ? `url("${profile.coverImage}") center / cover no-repeat`
                : 'linear-gradient(120deg, #0f172a 0%, #1d4ed8 58%, #38bdf8 100%)',
              position: 'relative',
              '&::after': profile.coverImage ? undefined : {
                content: '""',
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.18)',
                right: { xs: -75, sm: 48 },
                top: -100,
              },
            }}
          />
          <CardContent sx={{ px: { xs: 2.5, sm: 4 }, pb: 4, mt: -6, position: 'relative' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={2.5}>
              <Box sx={{ flexShrink: 0 }}>
                <Avatar
                  src={profile.photo || undefined}
                  alt={profile.fullName}
                  sx={{
                    width: 112,
                    height: 112,
                    border: '4px solid white',
                    bgcolor: 'primary.main',
                    fontSize: 38,
                    fontWeight: 700,
                    boxShadow: '0 5px 18px rgba(15, 23, 42, 0.16)',
                  }}
                >
                  {profile.fullName.trim().charAt(0).toUpperCase()}
                </Avatar>
              </Box>
              <Box sx={{ pb: 1, minWidth: 0 }}>
                <Typography variant="h4" component="h2" sx={{ fontSize: { xs: '1.65rem', sm: '2rem' } }}>
                  {profile.fullName || 'Your name'}
                </Typography>
                {profile.callingName && profile.callingName !== profile.firstName && (
                  <Typography variant="body2" color="text.secondary">
                    Call me {profile.callingName}
                  </Typography>
                )}
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {[profile.jobTitle, profile.organization].filter(Boolean).join(' · ') || 'Add your role and organization'}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              About
            </Typography>
            <Typography color={profile.bio ? 'text.secondary' : 'text.disabled'} sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {profile.bio || 'Add a few lines about yourself, what you do, or what you are working on.'}
            </Typography>

            <Stack direction="row" useFlexGap flexWrap="wrap" gap={2.5} sx={{ mt: 3 }}>
              {location && (
                <Stack direction="row" spacing={0.8} alignItems="center" color="text.secondary">
                  <LocationOnOutlinedIcon fontSize="small" />
                  <Typography variant="body2">{location}</Typography>
                </Stack>
              )}
              {profile.email && (
                <Stack direction="row" spacing={0.8} alignItems="center" color="text.secondary">
                  <MailOutlineIcon fontSize="small" />
                  <Typography variant="body2">{profile.email}</Typography>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6">Let’s connect</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
              Find me around the web
            </Typography>
            <Stack spacing={2.25}>
              <ProfileLink href={instagramUrl} icon={InstagramIcon} label="Instagram" value={profile.instagram} />
              <ProfileLink href={whatsappUrl} icon={WhatsAppIcon} label="WhatsApp" value={whatsappNumber} />
              <ProfileLink href={linkedinUrl} icon={LinkedInIcon} label="LinkedIn" value={profile.linkedin} />
              <ProfileLink href={websiteUrl} icon={LanguageIcon} label="Personal website" value={profile.website} />
              {profile.email && (
                <ProfileLink href={`mailto:${profile.email}`} icon={MailOutlineIcon} label="Send me an email" value={profile.email} />
              )}
              {profile.phone && (
                <ProfileLink href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} icon={PhoneIphoneIcon} label={profile.phone} value={profile.phone} />
              )}
              {!instagramUrl && !whatsappUrl && !linkedinUrl && !websiteUrl && !profile.email && !profile.phone && (
                <Typography variant="body2" color="text.secondary">
                  Add your social links and contact details to make it easy for people to reach you.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
