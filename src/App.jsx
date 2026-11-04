import { useState } from 'react';
import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './components/Sidebar.jsx';
import HomeView from './components/HomeView.jsx';
import ProjectsView from './components/ProjectsView.jsx';
import StudiesView from './components/StudiesView.jsx';
import ContactView from './components/ContactView.jsx';
import ProfileView from './components/ProfileView.jsx';
import SignInView from './components/SignInView.jsx';
import { NAV_ITEMS } from './data/navigation.js';
import { getStoredSession, signOut } from './auth.js';

const VIEWS = {
  home: HomeView,
  projects: ProjectsView,
  studies: StudiesView,
  contact: ContactView,
  profile: ProfileView,
  login: SignInView,
};

const PROTECTED_KEYS = ['profile'];

export default function App() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [session, setSession] = useState(getStoredSession);
  const [activeKey, setActiveKey] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user ?? null;

  const handleNavigate = (key) => {
    const target = PROTECTED_KEYS.includes(key) && !user ? 'login' : key;
    setActiveKey(target);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  const handleSignedIn = (newSession) => {
    setSession(newSession);
    setActiveKey('profile');
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  const handleSignOut = () => {
    signOut();
    setSession(null);
    handleNavigate('home');
  };

  const ActiveView = VIEWS[activeKey];
  const activeLabel = activeKey === 'login'
    ? 'Login'
    : NAV_ITEMS.find((item) => item.key === activeKey)?.label;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        items={NAV_ITEMS}
        activeKey={activeKey}
        onNavigate={handleNavigate}
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: { xs: 1, md: 0 }, flexGrow: 1 }}>
              {activeLabel}
            </Typography>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton aria-label="Open profile" onClick={() => handleNavigate('profile')} sx={{ p: 0.5 }}>
                  <Avatar src={user.photo || undefined} alt={user.fullName} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                    {user.fullName.trim().charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleSignOut}>
                  Sign out
                </Button>
              </Box>
            ) : (
              activeKey !== 'login' && (
                <Button variant="contained" startIcon={<LoginIcon />} onClick={() => handleNavigate('login')}>
                  Login
                </Button>
              )
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <ActiveView user={user} onSignedIn={handleSignedIn} />
        </Box>
      </Box>
    </Box>
  );
}
