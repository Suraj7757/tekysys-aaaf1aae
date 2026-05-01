import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const en = {
  common: {
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add', search: 'Search',
    submit: 'Submit', loading: 'Loading...', back: 'Back', next: 'Next', confirm: 'Confirm',
    yes: 'Yes', no: 'No', close: 'Close', reset: 'Reset', view: 'View', share: 'Share',
    name: 'Name', mobile: 'Mobile', email: 'Email', address: 'Address', status: 'Status',
    amount: 'Amount', date: 'Date', actions: 'Actions', total: 'Total', notes: 'Notes',
  },
  nav: {
    dashboard: 'Dashboard', customers: 'Customers', jobs: 'Repair Jobs', payments: 'Payments',
    inventory: 'Inventory', sells: 'Sales', reports: 'Reports', settings: 'Settings',
    wallet: 'Wallet', subscription: 'Subscription', branches: 'Branches', expenses: 'Expenses',
    loyalty: 'Loyalty', bookings: 'Bookings', analytics: 'Analytics', staff: 'Staff',
    trash: 'Trash', admin: 'Admin', logout: 'Sign Out', track: 'Track Order',
  },
  auth: {
    signin: 'Sign In', signup: 'Sign Up', signout: 'Sign Out', password: 'Password',
    forgotPassword: 'Forgot password?', noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?', shopkeeper: 'Shopkeeper', wholesaler: 'Wholesaler',
    customer: 'Customer', accountType: 'Account Type',
  },
  booking: {
    bookRepair: 'Book a Repair', yourName: 'Your Name', mobileNumber: 'Mobile Number',
    deviceBrand: 'Device Brand', model: 'Model', describeProblem: 'Describe the problem',
    preferredDate: 'Preferred date', submitRequest: 'Submit Request',
    requestSubmitted: 'Request Submitted!', shopWillContact: 'will contact you shortly on',
    shopNotFound: 'Shop Not Found', leaveReview: 'Leave a Review',
    rating: 'Your rating', writeComment: 'Write a comment...',
    submitReview: 'Submit Review', reviewsTitle: 'Customer Reviews', noReviews: 'No reviews yet — be the first!',
    reviewThanks: 'Thanks for your feedback!',
  },
  inventory: {
    addItem: 'Add Item', scanBarcode: 'Scan Barcode', sku: 'SKU', quantity: 'Quantity',
    sellPrice: 'Sell Price', costPrice: 'Cost Price', minStock: 'Min Stock', category: 'Category',
    lowStock: 'Low Stock', outOfStock: 'Out of Stock', scanToSearch: 'Scan to search...',
    notFound: 'Item not found', startCamera: 'Start Camera', stopCamera: 'Stop',
  },
  whatsapp: {
    title: 'WhatsApp Business API',
    subtitle: 'Send branded automated status messages directly from your business number.',
    phoneNumberId: 'Phone Number ID', accessToken: 'Access Token',
    businessAccountId: 'Business Account ID', enabled: 'Enabled', testSend: 'Send Test Message',
    setupGuide: 'Get these values from Meta Business Manager → WhatsApp → API Setup.',
    saved: 'WhatsApp config saved', testSent: 'Test message sent',
  },
  language: { language: 'Language', english: 'English', hindi: 'हिंदी', bengali: 'বাংলা' },
};

const hi = {
  common: {
    save: 'सेव', cancel: 'रद्द', delete: 'हटाएँ', edit: 'एडिट', add: 'जोड़ें', search: 'खोजें',
    submit: 'सबमिट', loading: 'लोड हो रहा है...', back: 'पीछे', next: 'अगला', confirm: 'पुष्टि',
    yes: 'हाँ', no: 'नहीं', close: 'बंद करें', reset: 'रीसेट', view: 'देखें', share: 'शेयर',
    name: 'नाम', mobile: 'मोबाइल', email: 'ईमेल', address: 'पता', status: 'स्थिति',
    amount: 'राशि', date: 'दिनांक', actions: 'कार्य', total: 'कुल', notes: 'नोट्स',
  },
  nav: {
    dashboard: 'डैशबोर्ड', customers: 'ग्राहक', jobs: 'मरम्मत कार्य', payments: 'भुगतान',
    inventory: 'इन्वेंट्री', sells: 'बिक्री', reports: 'रिपोर्ट्स', settings: 'सेटिंग्स',
    wallet: 'वॉलेट', subscription: 'सब्स्क्रिप्शन', branches: 'शाखाएँ', expenses: 'खर्च',
    loyalty: 'लॉयल्टी', bookings: 'बुकिंग्स', analytics: 'एनालिटिक्स', staff: 'स्टाफ',
    trash: 'ट्रैश', admin: 'एडमिन', logout: 'साइन आउट', track: 'ऑर्डर ट्रैक',
  },
  auth: {
    signin: 'साइन इन', signup: 'साइन अप', signout: 'साइन आउट', password: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?', noAccount: 'खाता नहीं है?',
    haveAccount: 'पहले से खाता है?', shopkeeper: 'दुकानदार', wholesaler: 'थोक विक्रेता',
    customer: 'ग्राहक', accountType: 'खाता प्रकार',
  },
  booking: {
    bookRepair: 'मरम्मत बुक करें', yourName: 'आपका नाम', mobileNumber: 'मोबाइल नंबर',
    deviceBrand: 'डिवाइस ब्रांड', model: 'मॉडल', describeProblem: 'समस्या बताएँ',
    preferredDate: 'पसंदीदा तारीख', submitRequest: 'रिक्वेस्ट सबमिट करें',
    requestSubmitted: 'रिक्वेस्ट सबमिट हो गई!', shopWillContact: 'जल्द ही संपर्क करेगी',
    shopNotFound: 'दुकान नहीं मिली', leaveReview: 'समीक्षा दें',
    rating: 'आपकी रेटिंग', writeComment: 'टिप्पणी लिखें...',
    submitReview: 'समीक्षा सबमिट', reviewsTitle: 'ग्राहक समीक्षाएँ', noReviews: 'अभी कोई समीक्षा नहीं — पहले बनें!',
    reviewThanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
  },
  inventory: {
    addItem: 'आइटम जोड़ें', scanBarcode: 'बारकोड स्कैन', sku: 'SKU', quantity: 'मात्रा',
    sellPrice: 'बिक्री मूल्य', costPrice: 'लागत मूल्य', minStock: 'न्यूनतम स्टॉक', category: 'श्रेणी',
    lowStock: 'कम स्टॉक', outOfStock: 'स्टॉक खत्म', scanToSearch: 'खोजने के लिए स्कैन...',
    notFound: 'आइटम नहीं मिला', startCamera: 'कैमरा शुरू', stopCamera: 'बंद',
  },
  whatsapp: {
    title: 'WhatsApp Business API',
    subtitle: 'अपने बिज़नेस नंबर से ब्रांडेड ऑटोमेटेड स्टेटस मैसेज भेजें।',
    phoneNumberId: 'फ़ोन नंबर ID', accessToken: 'एक्सेस टोकन',
    businessAccountId: 'बिज़नेस अकाउंट ID', enabled: 'सक्षम', testSend: 'टेस्ट मैसेज भेजें',
    setupGuide: 'Meta Business Manager → WhatsApp → API Setup से ये मान प्राप्त करें।',
    saved: 'WhatsApp कॉन्फ़िग सेव हो गई', testSent: 'टेस्ट मैसेज भेजा गया',
  },
  language: { language: 'भाषा', english: 'English', hindi: 'हिंदी', bengali: 'বাংলা' },
};

const bn = {
  common: {
    save: 'সংরক্ষণ', cancel: 'বাতিল', delete: 'মুছুন', edit: 'এডিট', add: 'যোগ', search: 'খুঁজুন',
    submit: 'জমা', loading: 'লোড হচ্ছে...', back: 'পিছনে', next: 'পরবর্তী', confirm: 'নিশ্চিত',
    yes: 'হ্যাঁ', no: 'না', close: 'বন্ধ', reset: 'রিসেট', view: 'দেখুন', share: 'শেয়ার',
    name: 'নাম', mobile: 'মোবাইল', email: 'ইমেইল', address: 'ঠিকানা', status: 'অবস্থা',
    amount: 'পরিমাণ', date: 'তারিখ', actions: 'অ্যাকশন', total: 'মোট', notes: 'নোট',
  },
  nav: {
    dashboard: 'ড্যাশবোর্ড', customers: 'গ্রাহক', jobs: 'মেরামতির কাজ', payments: 'পেমেন্ট',
    inventory: 'ইনভেন্টরি', sells: 'বিক্রয়', reports: 'রিপোর্ট', settings: 'সেটিংস',
    wallet: 'ওয়ালেট', subscription: 'সাবস্ক্রিপশন', branches: 'শাখা', expenses: 'খরচ',
    loyalty: 'লয়্যালটি', bookings: 'বুকিং', analytics: 'অ্যানালিটিক্স', staff: 'স্টাফ',
    trash: 'ট্র্যাশ', admin: 'অ্যাডমিন', logout: 'সাইন আউট', track: 'অর্ডার ট্র্যাক',
  },
  auth: {
    signin: 'সাইন ইন', signup: 'সাইন আপ', signout: 'সাইন আউট', password: 'পাসওয়ার্ড',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?', noAccount: 'অ্যাকাউন্ট নেই?',
    haveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?', shopkeeper: 'দোকানদার', wholesaler: 'পাইকারি বিক্রেতা',
    customer: 'গ্রাহক', accountType: 'অ্যাকাউন্টের ধরন',
  },
  booking: {
    bookRepair: 'মেরামতির বুকিং', yourName: 'আপনার নাম', mobileNumber: 'মোবাইল নম্বর',
    deviceBrand: 'ডিভাইস ব্র্যান্ড', model: 'মডেল', describeProblem: 'সমস্যা বর্ণনা করুন',
    preferredDate: 'পছন্দের তারিখ', submitRequest: 'অনুরোধ জমা',
    requestSubmitted: 'অনুরোধ জমা হয়েছে!', shopWillContact: 'শীঘ্রই যোগাযোগ করবে',
    shopNotFound: 'দোকান পাওয়া যায়নি', leaveReview: 'পর্যালোচনা দিন',
    rating: 'আপনার রেটিং', writeComment: 'মন্তব্য লিখুন...',
    submitReview: 'পর্যালোচনা জমা', reviewsTitle: 'গ্রাহক পর্যালোচনা', noReviews: 'এখনো কোনো রিভিউ নেই — প্রথম হোন!',
    reviewThanks: 'আপনার মতামতের জন্য ধন্যবাদ!',
  },
  inventory: {
    addItem: 'আইটেম যোগ', scanBarcode: 'বারকোড স্ক্যান', sku: 'SKU', quantity: 'পরিমাণ',
    sellPrice: 'বিক্রয় মূল্য', costPrice: 'মূল্য', minStock: 'ন্যূনতম স্টক', category: 'বিভাগ',
    lowStock: 'কম স্টক', outOfStock: 'স্টক শেষ', scanToSearch: 'খুঁজতে স্ক্যান...',
    notFound: 'আইটেম পাওয়া যায়নি', startCamera: 'ক্যামেরা চালু', stopCamera: 'বন্ধ',
  },
  whatsapp: {
    title: 'WhatsApp Business API',
    subtitle: 'আপনার ব্যবসায়িক নম্বর থেকে ব্র্যান্ডেড স্বয়ংক্রিয় বার্তা পাঠান।',
    phoneNumberId: 'ফোন নম্বর ID', accessToken: 'অ্যাক্সেস টোকেন',
    businessAccountId: 'বিজনেস অ্যাকাউন্ট ID', enabled: 'সক্রিয়', testSend: 'টেস্ট বার্তা পাঠান',
    setupGuide: 'Meta Business Manager → WhatsApp → API Setup থেকে মান সংগ্রহ করুন।',
    saved: 'WhatsApp কনফিগ সংরক্ষিত', testSent: 'টেস্ট বার্তা পাঠানো হয়েছে',
  },
  language: { language: 'ভাষা', english: 'English', hindi: 'हिंदी', bengali: 'বাংলা' },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, bn: { translation: bn } },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: 'rx-lang', caches: ['localStorage'] },
});

export default i18n;
