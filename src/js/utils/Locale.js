// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import Cookies from './Cookies';

const MOMENT_LOCALE_EXCEPTIONS = { zh: 'zh-CN', pa: 'pa-IN', hy: 'hy-AM' };
const documentLocale = document.documentElement.lang;
const localeFromDocument = documentLocale && MOMENT_LOCALE_EXCEPTIONS[documentLocale] || documentLocale;
let currentLocale = localeFromDocument || 'en-US';

function normalizeLocale(locale) {
  let locales = locale.replace(/_/g, '-').split('-');
  let normalizedLocale = locales[0];
  if (locales.length > 1) {
    normalizedLocale += '-' + locales[1].toUpperCase();
  }

  return normalizedLocale;
}

export function setLocale(locale) {
  currentLocale = normalizeLocale(locale);
}

export function getCurrentLocale() {
  if (localeFromDocument) {
    return currentLocale;
  }
  try {
    let cookieLanguages = Cookies.get('languages');
    let locale = cookieLanguages ? JSON.parse(cookieLanguages)[0] : undefined;
    if (!locale) {
      locale = window.navigator.languages ? window.navigator.languages[0] :
        (window.navigator.language || window.navigator.userLanguage);
    }

    return normalizeLocale(locale);
  } catch (e) {
    return currentLocale;
  }
}

export function getLocaleData(appMessages = {}, locale = getCurrentLocale()) {
  let grommetMessages;
  try {
    grommetMessages = require('../messages/' + locale);
  } catch (e) {
    grommetMessages = {};
  }

  let messages = { ...grommetMessages, ...appMessages };

  return {locale, messages};
}
