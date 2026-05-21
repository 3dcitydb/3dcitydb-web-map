import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

function waitForGis(timeoutMs = 5000): Promise<void> {
  if (typeof google !== 'undefined' && google.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const id = window.setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        window.clearInterval(id);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        window.clearInterval(id);
        reject(new Error('Google Identity Services script failed to load'));
      }
    }, 100);
  });
}

export const useAuthStore = defineStore('auth', () => {
  const clientId = ref<string | undefined>(undefined);
  const accessToken = ref<string | null>(null);
  const userName = ref<string | null>(null);
  const isSignedIn = computed(() => accessToken.value !== null);

  function setClientId(id: string | undefined) {
    clientId.value = id;
  }

  async function signIn(): Promise<void> {
    if (!clientId.value) {
      throw new Error('Google Client ID not configured (pass ?googleClientId=... in URL)');
    }
    await waitForGis();

    return new Promise((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId.value!,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          accessToken.value = response.access_token;
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` },
            });
            if (res.ok) {
              const data = (await res.json()) as { name?: string };
              userName.value = data.name ?? null;
            }
          } catch {
            // userinfo is best-effort; sign-in still succeeded
          }
          resolve();
        },
        error_callback: (error) => reject(new Error(error.message || error.type)),
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  function signOut(): void {
    const token = accessToken.value;
    if (token && typeof google !== 'undefined' && google.accounts?.oauth2) {
      try {
        google.accounts.oauth2.revoke(token);
      } catch (err) {
        console.warn('GIS revoke failed:', err);
      }
    }
    accessToken.value = null;
    userName.value = null;
    ElMessage.success('Signed out');
  }

  return { clientId, accessToken, userName, isSignedIn, setClientId, signIn, signOut };
});
