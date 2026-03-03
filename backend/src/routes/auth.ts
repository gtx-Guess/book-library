import { Router } from 'express';
import { login, register, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import {
  webAuthnRegisterStart,
  webAuthnRegisterFinish,
  webAuthnAuthStart,
  webAuthnAuthFinish,
} from '../controllers/webAuthnController';
import {
  generateInviteCode,
  getMyInviteCodes,
  deactivateInviteCode,
} from '../controllers/inviteController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Invite codes — all require authentication
router.post('/invite-codes', authenticate, generateInviteCode);
router.get('/invite-codes', authenticate, getMyInviteCodes);
router.patch('/invite-codes/:id/deactivate', authenticate, deactivateInviteCode);

// WebAuthn — registration requires existing JWT; authentication is public
router.post('/webauthn/register/start', authenticate, webAuthnRegisterStart);
router.post('/webauthn/register/finish', authenticate, webAuthnRegisterFinish);
router.post('/webauthn/authenticate/start', webAuthnAuthStart);
router.post('/webauthn/authenticate/finish', webAuthnAuthFinish);

export default router;
