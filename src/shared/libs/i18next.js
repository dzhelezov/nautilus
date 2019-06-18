import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";

i18n.use(reactI18nextModule).init(
    {
        fallbackLng: 'en',
        fallbackNS: 'global',
        debug: false,
        parseMissingKeyHandler: (value) => `Translation not available for ${value}`,
        resources: {
            en: require('../locales/en.json'),
            ar: require('../locales/en.json'),
            cs: require('../locales/en.json'),
            da: require('../locales/en.json'),
            de: require('../locales/en.json'),
        },
        interpolation: {
            escapeValue: false,
            format: (value, format) => {
                if (format === 'uppercase') {
                    return value.toUpperCase();
                }

                return value;
            },
        },
        react: {
            wait: false,
            bindI18n: 'languageChanged loaded',
            bindStore: 'added removed',
            nsMode: 'default',
        },
    },
    (err) => {
        if (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    },
);
export default i18n;
