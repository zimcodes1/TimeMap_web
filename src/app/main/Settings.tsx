import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import SettingsView from "@/pages/main/SettingsView";
import { registerDeviceTokenAPI, deactivateDeviceTokenAPI } from "@/api/main/notificationsAPI";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SettingsContainer() {
  const { user, logout } = useAuth();
  const [fcmEnabled, setFcmEnabled] = useState(true);
  const [activeFcmToken, setActiveFcmToken] = useState<string>("web_fcm_token_demo_123");

  const registerPushMutation = useMutation({
    mutationFn: (token: string) => registerDeviceTokenAPI({ fcm_token: token, platform: "web" }),
    onSuccess: () => {
      setFcmEnabled(true);
      toast.success("Web Push Notifications enabled & device token registered.");
    },
    onError: () => toast.error("Failed to register Web Push device token."),
  });

  const deactivatePushMutation = useMutation({
    mutationFn: (token: string) => deactivateDeviceTokenAPI(token),
    onSuccess: () => {
      setFcmEnabled(false);
      toast.success("Web Push Notifications disabled.");
    },
    onError: () => toast.error("Failed to deactivate Web Push device token."),
  });

  const handleTogglePush = () => {
    if (fcmEnabled) {
      deactivatePushMutation.mutate(activeFcmToken);
    } else {
      const newToken = `web_token_${Date.now()}`;
      setActiveFcmToken(newToken);
      registerPushMutation.mutate(newToken);
    }
  };

  const handleLogout = () => {
    toast.info("Logging out admin session...");
    logout();
  };

  const isTogglingPush = registerPushMutation.isPending || deactivatePushMutation.isPending;

  return (
    <SettingsView
      user={user}
      fcmEnabled={fcmEnabled}
      isTogglingPush={isTogglingPush}
      onTogglePush={handleTogglePush}
      onLogout={handleLogout}
    />
  );
}
