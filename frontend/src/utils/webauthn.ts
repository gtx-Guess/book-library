export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) return false;
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}
