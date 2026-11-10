/** Shared client/test validation, without DOM or transport side effects.
 * @param {{name?: string,email?: string,phone?: string,message?: string,type?: string,consent_required?: boolean,consent_optional?: boolean}} values
 * @param {{name: string,size: number}[]} files */
export function validateInquiry(values, files = []) {
  const errors = [];
  if (!values.name?.trim() || values.name.trim().length > 50) errors.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() || '') || (values.email?.length || 0) > 254) errors.push('email');
  if (values.phone?.trim()) {
    if (!/^[0-9+\-\s()]{8,20}$/.test(values.phone.trim())) errors.push('phone');
    if (!values.consent_optional) errors.push('phoneConsent');
  }
  if (!values.message?.trim() || values.message.trim().length > 5000) errors.push('message');
  if (values.type !== 'dev') {
    if (files.some(f => !/\.(3mf|stl)$/i.test(f.name))) errors.push('fileType');
    if (files.length > 5) errors.push('fileCount');
    if (files.reduce((sum,f) => sum + f.size,0) > 209715200) errors.push('fileSize');
  }
  if (!values.consent_required) errors.push('consent');
  return errors;
}
