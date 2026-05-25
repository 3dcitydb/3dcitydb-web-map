import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { asBool } from '../state/useUrlState';

type MobileOS = 'iOS' | 'Android' | 'WindowsPhone' | 'unknown';

const MOBILE_RE = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function detectOS(ua: string): MobileOS {
  if (/windows phone/i.test(ua)) return 'WindowsPhone';
  if (/android/i.test(ua)) return 'Android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  // iPadOS 13+ reports as Mac; disambiguate with touchpoints.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'iOS';
  return 'unknown';
}

interface MobileState {
  isMobile: Ref<boolean>;
  isIOS: ComputedRef<boolean>;
}

let cached: MobileState | undefined;

function create(): MobileState {
  const ua = navigator.userAgent || '';
  const forced = asBool(new URLSearchParams(window.location.search).get('mobile') ?? undefined);
  const mobileFromUA = MOBILE_RE.test(ua);
  const coarseMq = window.matchMedia('(pointer: coarse)');
  const mobileOS = detectOS(ua);
  const isMobile = ref(forced ?? (mobileFromUA || coarseMq.matches));

  // URL override and UA detection are authoritative; only react to media-query flips otherwise.
  if (forced === undefined && !mobileFromUA) {
    coarseMq.addEventListener('change', (e) => {
      isMobile.value = e.matches;
    });
  }

  return {
    isMobile,
    isIOS: computed(() => mobileOS === 'iOS'),
  };
}

export function useMobile(): MobileState {
  return (cached ??= create());
}
