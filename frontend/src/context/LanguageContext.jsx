import { createContext, useEffect, useState } from "react";

export const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    members: "Members",
    settings: "Settings",
    projectManager: "Project Manager",
    profile: "Profile",
    notifications: "Notifications",
    activity: "Activity",
    settingsTitle: "Settings",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    projects: "प्रोजेक्ट्स",
    members: "सदस्य",
    settings: "सेटिंग्स",
    projectManager: "प्रोजेक्ट मैनेजर",
    profile: "प्रोफाइल",
    notifications: "सूचनाएं",
    activity: "गतिविधि",
    settingsTitle: "सेटिंग्स",
  },
};

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
