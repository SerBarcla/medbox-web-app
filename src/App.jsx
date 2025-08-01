import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Auth from './components/Auth.jsx';
import PatientPortal from './components/PatientPortal.jsx';
import CreateProfile from './components/CreateProfile.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function checks Firestore for a user's profile
  const checkUserProfile = async (authUser) => {
    if (!authUser) {
      setUserProfile(null);
      return;
    }
    const userDocRef = doc(db, 'users', authUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    } else {
      setUserProfile({ needsProfile: true });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      await checkUserProfile(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Render different components based on auth state and profile status
  const renderContent = () => {
    if (user) {
      if (userProfile?.needsProfile) {
        // We pass a function to CreateProfile that will re-check the profile
        // once it has been created, triggering a re-render.
        return <CreateProfile user={user} onProfileCreated={() => checkUserProfile(user)} />;
      }
      if (userProfile?.role === 'patient') {
        return <PatientPortal user={user} profile={userProfile} />;
      }
      return <div>Unknown role or profile issue. Please contact support.</div>;
    }
    return <Auth />;
  };

  return <AppContainer>{renderContent()}</AppContainer>;
}

export default App;
