import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import {
  webAuthnRegisterStart,
  webAuthnRegisterFinish,
  webAuthnAuthStart,
  webAuthnAuthFinish,
} from '../controllers/webAuthnController';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// WebAuthn — registration requires existing JWT; authentication is public
router.post('/webauthn/register/start', authenticate, webAuthnRegisterStart);
router.post('/webauthn/register/finish', authenticate, webAuthnRegisterFinish);
router.post('/webauthn/authenticate/start', webAuthnAuthStart);
router.post('/webauthn/authenticate/finish', webAuthnAuthFinish);

export default router;
