export const dictionaries = {
  en: {
    appName: 'Calorie Tracker',
    navToday: 'Today',
    navAdd: 'Add',
    navSettings: 'Settings',
    quickCalendar: 'Calendar',
    quickProfile: 'Profile',
    summary: 'Summary',
    nutrition: 'Nutrition',
    water: 'Water',
    activities: 'Activities',
    measurements: 'Measurements'
  },
  de: {
    appName: 'Kalorien-Tracker',
    navToday: 'Heute',
    navAdd: 'Hinzufugen',
    navSettings: 'Einstellungen',
    quickCalendar: 'Kalender',
    quickProfile: 'Profil',
    summary: 'Zusammenfassung',
    nutrition: 'Ernahrung',
    water: 'Wasser',
    activities: 'Aktivitaten',
    measurements: 'Messungen'
  }
} as const;

export type DictionaryKey = keyof (typeof dictionaries)['en'];
