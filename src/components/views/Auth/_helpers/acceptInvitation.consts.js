import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for accept invitation form data
export const $acceptInvitationForm = Signal({
  name: '',
  password: '',
  confirmPassword: '',
});

// Signal for component view state
export const $acceptInvitationView = Signal({
  invitation: null,
  isLoading: true,
  isAccepting: false,
  error: null,
});
