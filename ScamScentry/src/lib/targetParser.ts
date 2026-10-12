import { ThreatCategory, Platform, PublisherOrDeveloper } from '@/types/threat';

export interface ParsedTarget {
  rawInput: string;
  targetIdentifier: string;
  displayName: string;
  category: ThreatCategory;
  platform: Platform;
  detectedType: 'domain' | 'social_handle' | 'mobile_package' | 'url';
  publisher: PublisherOrDeveloper;
  suggestedContextText: string;
}

export function parseTargetInput(raw: string, brandName: string = 'Enterprise'): ParsedTarget {
  const trimmed = raw.trim();
  let targetIdentifier = trimmed;
  let displayName = trimmed;
  let category: ThreatCategory = 'phishing_website';
  let platform: Platform = 'web';
  let detectedType: ParsedTarget['detectedType'] = 'domain';
  let suggestedContextText = '';

  const cleanBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Social Handle Detection (@handle or social url)
  if (
    trimmed.startsWith('@') ||
    trimmed.includes('twitter.com/') ||
    trimmed.includes('x.com/') ||
    trimmed.includes('instagram.com/') ||
    trimmed.includes('t.me/')
  ) {
    detectedType = 'social_handle';
    category = 'social_impersonation';

    if (trimmed.includes('instagram.com/')) {
      platform = 'instagram';
      const handle = trimmed.split('instagram.com/')[1]?.split(/[/?#]/)[0] || trimmed;
      targetIdentifier = handle.startsWith('@') ? handle : `@${handle}`;
    } else if (trimmed.includes('t.me/')) {
      platform = 'telegram';
      const handle = trimmed.split('t.me/')[1]?.split(/[/?#]/)[0] || trimmed;
      targetIdentifier = handle.startsWith('@') ? handle : `@${handle}`;
    } else {
      platform = 'x';
      const handle = trimmed.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '').split(/[/?#]/)[0];
      targetIdentifier = handle.startsWith('@') ? handle : `@${handle}`;
    }

    displayName = `${targetIdentifier.replace('@', '')} (Impersonation Handle)`;
    suggestedContextText = `Discovered persona active on ${platform.toUpperCase()}. Bio claims "Official Customer Service Desk & Fast Wallet Support". Directs users to unverified links for account verification.`;
  }
  // 2. Mobile App Package ID (com.example.app or id123456 or apkcombo)
  else if (
    trimmed.startsWith('com.') ||
    trimmed.startsWith('org.') ||
    trimmed.startsWith('io.') ||
    trimmed.startsWith('net.') ||
    trimmed.startsWith('apk:') ||
    trimmed.includes('.apk') ||
    /^id\d{6,12}$/i.test(trimmed)
  ) {
    detectedType = 'mobile_package';
    category = 'suspicious_mobile_app';
    platform = trimmed.includes('apple') || /^id\d+$/i.test(trimmed) ? 'apple_app_store' : 'third_party_apk';
    targetIdentifier = trimmed.replace(/^apk:/, '');
    displayName = `${targetIdentifier.split('.').pop() || targetIdentifier} Mobile Package`;
    suggestedContextText = `Android package manifest requests intrusive telecommunication privileges (READ_SMS, RECEIVE_SMS, BIND_ACCESSIBILITY_SERVICE). Distributed via third-party mirrors mimicking official ${brandName} apps.`;
  }
  // 3. Domain or URL
  else {
    detectedType = 'domain';
    category = 'phishing_website';
    platform = 'web';

    let cleanUrl = trimmed;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    targetIdentifier = cleanUrl;

    try {
      const urlObj = new URL(cleanUrl);
      displayName = urlObj.hostname;
    } catch {
      displayName = trimmed;
    }

    suggestedContextText = `Discovered credential harvesting webpage matching protected ${brandName} authentication workflow. Contains active DOM input fields for username, password, and 2FA OTP codes.`;
  }

  // Realistic publisher generation based on input
  const tldMatch = targetIdentifier.match(/\.([a-z0-9]+)(?:[/?#]|$)/i);
  const tld = tldMatch ? tldMatch[1].toLowerCase() : 'com';
  
  const registrarMap: Record<string, string> = {
    cc: 'NiceNIC International Group Limited',
    xyz: 'NameCheap Privacy Protection Inc',
    top: 'Jiangsu Bangning Science & Tech Co.',
    tk: 'Freenom Ephemeral DNS Services',
    online: 'Hostinger Operations UAB',
    site: 'Tucows Domains Inc',
    io: 'Cloudflare Registrar',
    com: 'NameSilo LLC / Privacy Guardian',
  };

  const publisher: PublisherOrDeveloper = {
    organizationName: detectedType === 'social_handle'
      ? `Unverified Persona (${targetIdentifier})`
      : detectedType === 'mobile_package'
      ? `Rogue Publisher (${targetIdentifier.split('.')[1] || 'Unknown'})`
      : `Registrant via ${registrarMap[tld] || 'Privacy Protected Service'}`,
    registrar: detectedType === 'domain' ? (registrarMap[tld] || 'Privacy Protected Service') : undefined,
    developerAccount: detectedType === 'mobile_package' ? `Third-Party Mirror (${targetIdentifier})` : undefined,
    hostingAsn: detectedType === 'domain' ? 'AS49453 Bulletproof Transit Provider' : undefined,
    country: detectedType === 'domain' ? 'Offshore / High Privacy Jurisdiction' : 'Anonymized Proxy / VPN',
    registrationDate: new Date(Date.now() - 48 * 3600000).toISOString().split('T')[0],
  };

  return {
    rawInput: raw,
    targetIdentifier,
    displayName,
    category,
    platform,
    detectedType,
    publisher,
    suggestedContextText,
  };
}
