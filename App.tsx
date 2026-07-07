// App.tsx

import React, { useEffect } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuth } from "./src/context/AuthContext";
import { registerForPushNotifications } from "./src/services/notificationService";

function AppContent() {
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      registerForPushNotifications(userId);
    }
  }, [userId]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}