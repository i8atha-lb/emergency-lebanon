// Content Moderation System
// Filters inappropriate, scam, spam, and unsafe content

// Scam & Fraud Keywords (Arabic & English)
const SCAM_KEYWORDS = [
  // Money/Payment requests
  'حوالة', 'تحويل مالي', 'ويسترن يونيون', 'western union', 'مونيغرام', 'moneygram',
  'بيتكوين', 'bitcoin', 'عملة رقمية', 'cryptocurrency', 'دولار', 'يورو', 'ليرة تركية',
  'ادفع', 'pay', 'سلفة', 'قرض', 'loan', 'اموال', 'فلوس', 'مصاري',

  // Fake organizations
  'الامم المتحدة تدفع', 'un is paying', 'منحة مجانية', 'free grant',
  'اليانصيب', 'lottery', 'فزت', 'won', 'جائزة', 'prize',

  // Urgency scams
  'اتصل فورا', 'call immediately', 'عرض لمدة محدودة', 'limited time',
  'آخر فرصة', 'last chance', 'اضغط هنا', 'click here'
]

// Inappropriate Content (Sexual/Violence/Hate)
const INAPPROPRIATE_KEYWORDS = [
  // Sexual content (keeping list minimal and in Arabic)
  'جنس', 'سكس', 'عاهرة', 'متعة', 'دعارة',

  // Violence/weapons
  'سلاح', 'weapon', 'قنبلة', 'bomb', 'متفجرات', 'explosives',
  'اقتل', 'kill', 'اغتيال', 'assassination',

  // Hate speech
  'كلب', 'قذر', 'نجس', 'ملعون', 'خنزير'
]

// Spam & Commercial
const SPAM_KEYWORDS = [
  // Advertisements
  'للبيع', 'for sale', 'اشتري', 'buy', 'تسوق', 'shop',
  'منتج', 'product', 'عرض خاص', 'special offer', 'خصم', 'discount',
  'تجارة', 'business', 'استثمار', 'investment',

  // Multi-level marketing
  'اعمل من المنزل', 'work from home', 'ربح سريع', 'quick profit',
  'كن شريكي', 'be my partner', 'فرصة عمل', 'job opportunity',

  // Suspicious phrases
  'زيارة الموقع', 'visit website', 'اضغط الرابط', 'click link',
  'تحميل التطبيق', 'download app', 'سجل الآن', 'register now'
]

// Political/Religious Divisiveness
const DIVISIVE_KEYWORDS = [
  // Political parties/figures (focus on divisive language, not neutral mentions)
  'حزب الله خونة', 'القوات خونة', 'التيار خونة', 'جعجع', 'عون',

  // Sectarian incitement
  'شيعي قذر', 'سني قذر', 'مسيحي قذر', 'درزي',
  'طائفة', 'sect', 'فتنة طائفية', 'sectarian',

  // War incitement (not neutral mention of conflict)
  'يستحقون القصف', 'deserve bombing', 'اقتلوهم', 'kill them all',
  'حرب اهلية', 'civil war', 'انتقام', 'revenge'
]

// Suspicious Contact Info Patterns
const SUSPICIOUS_PATTERNS = {
  // International premium numbers
  internationalNumbers: /(\+9[0-9]{2}|\+44\s?900|\+1\s?900|\+971)/g,

  // Suspicious emails
  suspiciousEmails: /(gmail\.con|yaho\.com|hotmale\.com|temporarymail|10minutemail|guerrillamail)/gi,

  // URLs (only allow known safe domains)
  urls: /(https?:\/\/[^\s]+|www\.[^\s]+)/gi,

  // Cryptocurrency addresses
  cryptoAddresses: /(bc1|0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})/g,

  // Multiple phone numbers (suspicious pattern)
  multiplePhones: /(\+?[0-9]{3,}[\s\-]?[0-9]{3,}[\s\-]?[0-9]{3,}.*){3,}/g
}

// Whitelisted URLs (safe organizations)
const WHITELISTED_DOMAINS = [
  'unhcr.org',
  'redcross.org',
  'redcrescent.org',
  'unicef.org',
  'wfp.org',
  'who.int',
  'gov.lb'
]

/**
 * Check if text contains blocked keywords
 * @param {string} text - Text to check
 * @returns {{isBlocked: boolean, reason: string, category: string}}
 */
export const checkContent = (text) => {
  if (!text || typeof text !== 'string') {
    return { isBlocked: false }
  }

  const normalizedText = text.toLowerCase().trim()

  // Check scam keywords
  for (const keyword of SCAM_KEYWORDS) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      return {
        isBlocked: true,
        reason: 'المنشور يحتوي على كلمات مرتبطة بالاحتيال أو طلبات مالية. هذه المنصة لتقديم المأوى فقط.',
        category: 'scam'
      }
    }
  }

  // Check inappropriate content
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      return {
        isBlocked: true,
        reason: 'المنشور يحتوي على محتوى غير لائق. يرجى استخدام لغة مناسبة.',
        category: 'inappropriate'
      }
    }
  }

  // Check spam
  for (const keyword of SPAM_KEYWORDS) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      return {
        isBlocked: true,
        reason: 'المنشور يبدو كإعلان تجاري. هذه المنصة للمساعدة الإنسانية فقط.',
        category: 'spam'
      }
    }
  }

  // Check divisive content
  for (const keyword of DIVISIVE_KEYWORDS) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      return {
        isBlocked: true,
        reason: 'المنشور يحتوي على محتوى طائفي أو سياسي مسيء. المنصة لمساعدة جميع اللبنانيين.',
        category: 'divisive'
      }
    }
  }

  // Check suspicious patterns
  const patternChecks = checkSuspiciousPatterns(text)
  if (patternChecks.isBlocked) {
    return patternChecks
  }

  return { isBlocked: false }
}

/**
 * Check for suspicious patterns (URLs, phone numbers, crypto addresses)
 * @param {string} text
 * @returns {{isBlocked: boolean, reason?: string, category?: string}}
 */
function checkSuspiciousPatterns(text) {
  // Check for cryptocurrency addresses
  if (SUSPICIOUS_PATTERNS.cryptoAddresses.test(text)) {
    return {
      isBlocked: true,
      reason: 'المنشور يحتوي على عنوان محفظة رقمية. غير مسموح بطلبات العملات الرقمية.',
      category: 'crypto'
    }
  }

  // Check for multiple phone numbers (potential spam)
  if (SUSPICIOUS_PATTERNS.multiplePhones.test(text)) {
    return {
      isBlocked: true,
      reason: 'المنشور يحتوي على أرقام هواتف متعددة. يرجى تقديم رقم واحد فقط للتواصل.',
      category: 'multiple_phones'
    }
  }

  // Check for international premium numbers
  if (SUSPICIOUS_PATTERNS.internationalNumbers.test(text)) {
    return {
      isBlocked: true,
      reason: 'رقم الهاتف يبدو دولياً أو مشبوهاً. يرجى استخدام رقم لبناني محلي.',
      category: 'suspicious_phone'
    }
  }

  // Check for suspicious emails
  if (SUSPICIOUS_PATTERNS.suspiciousEmails.test(text)) {
    return {
      isBlocked: true,
      reason: 'البريد الإلكتروني يبدو مشبوهاً أو مؤقتاً. يرجى استخدام بريد إلكتروني حقيقي.',
      category: 'suspicious_email'
    }
  }

  // Check for URLs (unless whitelisted)
  const urls = text.match(SUSPICIOUS_PATTERNS.urls)
  if (urls) {
    const hasWhitelistedUrl = urls.some(url =>
      WHITELISTED_DOMAINS.some(domain => url.toLowerCase().includes(domain))
    )

    if (!hasWhitelistedUrl) {
      return {
        isBlocked: true,
        reason: 'المنشور يحتوي على روابط خارجية. يرجى عدم إضافة روابط.',
        category: 'url'
      }
    }
  }

  return { isBlocked: false }
}

/**
 * Check all text fields in a form submission
 * @param {Object} formData - Form data with text fields
 * @returns {{isBlocked: boolean, reason?: string, category?: string, field?: string}}
 */
export const checkFormContent = (formData) => {
  const fieldsToCheck = Object.entries(formData).filter(([key, value]) =>
    typeof value === 'string' && value.length > 0
  )

  for (const [field, value] of fieldsToCheck) {
    const result = checkContent(value)
    if (result.isBlocked) {
      return { ...result, field }
    }
  }

  return { isBlocked: false }
}

/**
 * Validate Lebanese phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidLebanesePhone = (phone) => {
  if (!phone) return true // Optional field

  const cleanPhone = phone.replace(/[\s\-()]/g, '')

  // Lebanese mobile patterns:
  // +96170123456, 96170123456, 070123456, 70123456 (8 digits without prefix)
  const patterns = [
    /^\+?961(3|70|71|76|78|79|81)[0-9]{6}$/,  // Full format with country code
    /^0?(3|70|71|76|78|79|81)[0-9]{6}$/,      // Local format with/without leading 0
    /^(3|70|71|76|78|79|81)[0-9]{6}$/         // Just 8 digits
  ]

  return patterns.some(pattern => pattern.test(cleanPhone))
}

/**
 * Sanitize text by removing excessive whitespace and special characters
 * @param {string} text
 * @returns {string}
 */
export const sanitizeText = (text) => {
  if (!text) return ''

  return text
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .slice(0, 2000) // Max length to prevent abuse
}
