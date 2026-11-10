/** @param {{contact: string, subject: string, values: Record<string, any>, files?: {name: string}[], copy: Record<string,string>}} input */
export function buildMailto({ contact, subject, values, files = [], copy }) {
  const body = [
    `${copy['form.type']}: ${copy[`tab.${values.type || 'print'}`]}`,
    ...['name','email','phone',...(values.type === 'ax' ? ['company'] : []),'message'].map(key => `${copy[`label.${key}`]}: ${String(values[key] || '').trim()}`),
    `${copy['consent.required']}: ${values.consent_required ? '✓' : '✕'}`,
    `${copy['consent.optional']}: ${values.consent_optional ? '✓' : '✕'}`,
    ...((values.type || 'print') === 'print' && files.length ? [files.map(f => f.name).join('\n'),copy['form.offlineFiles']] : []),
  ].join('\n');
  return `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
