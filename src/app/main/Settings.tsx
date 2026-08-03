import { useState } from 'react';
import SettingsView from '@/pages/main/SettingsView';
import ConnectCalendarModal from '@/components/modals/ConnectCalendarModal';
import { mockCurrentUser } from '@/constants/mockData';

export default function SettingsContainer() {
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const handleConnectCalendar = () => {
    setIsCalendarConnected((prev) => !prev);
  };

  return (
    <>
      <SettingsView
        user={mockCurrentUser}
        isCalendarConnected={isCalendarConnected}
        onOpenConnectCalendar={() => setIsCalendarModalOpen(true)}
      />

      <ConnectCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onConnect={handleConnectCalendar}
        isConnected={isCalendarConnected}
      />
    </>
  );
}
