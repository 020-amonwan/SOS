/**
 * Triage Score Calculator according to Business Rule BR-01
 * Categories:
 * - RED (Critical / High Priority): Bedridden, Medical Devices, Water level Roof/Floor2, or No Food + Vulnerable
 * - YELLOW (Urgent): Elderly, Children, Water Level Chest, Low Food
 * - GREEN (Normal): Adults, Knee level water, Enough food
 */

export function calculateTriage(data) {
  const {
    isBedridden,
    hasMedicalDevice,
    isElderly,
    isChildren,
    waterLevel,
    foodStatus
  } = data;

  // Check RED CRITICAL conditions (BR-01)
  if (isBedridden || hasMedicalDevice || waterLevel === 'ROOF' || waterLevel === 'FLOOR2') {
    return {
      code: 'RED',
      title: 'เคสสีแดง (วิกฤตด่วนที่สุด)',
      dotClass: 'bg-red-600 animate-ping',
      titleClass: 'text-red-400',
      bannerClass: 'bg-red-950/70 border-red-800',
      badgeCode: 'CRITICAL'
    };
  }

  // Check YELLOW URGENT conditions
  if (isElderly || isChildren || waterLevel === 'CHEST' || foodStatus === 'NONE' || foodStatus === 'LOW') {
    return {
      code: 'YELLOW',
      title: 'เคสสีเหลือง (เร่งด่วน)',
      dotClass: 'bg-amber-500',
      titleClass: 'text-amber-400',
      bannerClass: 'bg-amber-950/50 border-amber-800',
      badgeCode: 'URGENT'
    };
  }

  // Default GREEN STANDARD
  return {
    code: 'GREEN',
    title: 'เคสสีเขียว (ทั่วไป)',
    dotClass: 'bg-emerald-500',
    titleClass: 'text-emerald-400',
    bannerClass: 'bg-slate-800/80 border-slate-700',
    badgeCode: 'NORMAL'
  };
}
