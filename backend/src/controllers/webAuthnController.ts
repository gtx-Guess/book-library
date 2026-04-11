import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

const RP_NAME = 'Book Library';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'book.tdnet.xyz';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'https://book.tdnet.xyz';
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// POST /api/auth/webauthn/register/start  (requires JWT — not demo)
export async function webAuthnRegisterStart(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const username = req.user!.username;

    if (req.user!.role === 'demo') {
      return res.status(403).json({ error: 'WebAuthn registration is not available for the demo account' });
    }

    const existingCredentials = await prisma.webAuthnCredential.findMany({
      where: { userId },
      select: { credentialId: true, transports: true },
    });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: username,
      userDisplayName: username,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
      excludeCredentials: existingCredentials.map((c) => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[],
      })),
      timeout: 60000,
    });

    // Replace any existing registration challenge
    await prisma.webAuthnChallenge.deleteMany({ where: { userId, type: 'registration' } });
    await prisma.webAuthnChallenge.create({
      data: {
        userId,
        challenge: options.challenge,
        type: 'registration',
        expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
      },
    });

    return res.json(options);
  } catch (error) {
    console.error('WebAuthn register start error:', error);
    return res.status(500).json({ error: 'Failed to start registration' });
  }
}

// POST /api/auth/webauthn/register/finish  (requires JWT — not demo)
export async function webAuthnRegisterFinish(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    if (req.user!.role === 'demo') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const storedChallenge = await prisma.webAuthnChallenge.findFirst({
      where: { userId, type: 'registration' },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedChallenge || storedChallenge.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Challenge expired or not found. Please start registration again.' });
    }

    const body: RegistrationResponseJSON = req.body;

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Registration verification failed' });
    }

    const { registrationInfo } = verification;

    await prisma.webAuthnCredential.create({
      data: {
        userId,
        credentialId: registrationInfo.credential.id,
        publicKey: Buffer.from(registrationInfo.credential.publicKey).toString('base64url'),
        counter: registrationInfo.credential.counter,
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        transports: (body.response.transports as string[]) ?? [],
      },
    });

    await prisma.webAuthnChallenge.deleteMany({ where: { userId, type: 'registration' } });

    return res.json({ verified: true });
  } catch (error) {
    console.error('WebAuthn register finish error:', error);
    return res.status(500).json({ error: 'Failed to finish registration' });
  }
}

// POST /api/auth/webauthn/authenticate/start  (public)
export async function webAuthnAuthStart(req: Request, res: Response) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        webAuthnCreds: { select: { credentialId: true, transports: true } },
      },
    });

    if (!user || user.webAuthnCreds.length === 0) {
      return res.status(400).json({ error: 'No WebAuthn credentials registered for this account' });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: user.webAuthnCreds.map((c) => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[],
      })),
      userVerification: 'required',
      timeout: 60000,
    });

    await prisma.webAuthnChallenge.deleteMany({ where: { userId: user.id, type: 'authentication' } });
    await prisma.webAuthnChallenge.create({
      data: {
        userId: user.id,
        challenge: options.challenge,
        type: 'authentication',
        expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
      },
    });

    return res.json(options);
  } catch (error) {
    console.error('WebAuthn auth start error:', error);
    return res.status(500).json({ error: 'Failed to start authentication' });
  }
}

// POST /api/auth/webauthn/authenticate/finish  (public)
export async function webAuthnAuthFinish(req: Request, res: Response) {
  try {
    const { username, response: authResponse } = req.body as {
      username: string;
      response: AuthenticationResponseJSON;
    };

    if (!username || !authResponse) {
      return res.status(400).json({ error: 'Username and response are required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const storedChallenge = await prisma.webAuthnChallenge.findFirst({
      where: { userId: user.id, type: 'authentication' },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedChallenge || storedChallenge.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Challenge expired. Please try again.' });
    }

    const credential = await prisma.webAuthnCredential.findUnique({
      where: { credentialId: authResponse.id },
    });

    if (!credential || credential.userId !== user.id) {
      return res.status(401).json({ error: 'Credential not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: Number(credential.counter),
        transports: credential.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    await prisma.webAuthnCredential.update({
      where: { credentialId: credential.credentialId },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    });

    await prisma.webAuthnChallenge.deleteMany({ where: { userId: user.id, type: 'authentication' } });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error('WebAuthn auth finish error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
