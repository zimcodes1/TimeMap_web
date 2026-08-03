import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface ConnectCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  isConnected: boolean;
}

export default function ConnectCalendarModal({
  isOpen,
  onClose,
  onConnect,
  isConnected,
}: ConnectCalendarModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isConnected ? 'Disconnect Google Calendar' : 'Connect Google Calendar'}
      description={
        isConnected
          ? 'Revoke OAuth calendar access and stop timetable sync.'
          : 'Authorize Google OAuth access to sync lecture and exam schedules to your Google Calendar.'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isConnected ? 'danger' : 'primary'}
            onClick={() => {
              onConnect();
              onClose();
            }}
          >
            {isConnected ? 'Disconnect' : 'Connect Google Account'}
          </Button>
        </>
      }
    >
      <div className="p-4 bg-surface-raised rounded-xl border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
          G
        </div>
        <div>
          <Text variant="caption" className="font-bold text-text-main block">
            Google Calendar Sync Integration
          </Text>
          <Text variant="caption" color="muted" className="block text-xs">
            {isConnected ? 'Status: Currently Synced & Connected' : 'Status: Not Connected'}
          </Text>
        </div>
      </div>
    </Modal>
  );
}
