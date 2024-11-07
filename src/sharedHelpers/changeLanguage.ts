import i18n from "i18next";
import { zustandStorage } from "stores/useStore";

const changeLanguage = newLocale => {
  i18n.changeLanguage( newLocale );
  zustandStorage.setItem( "currentLocale", newLocale );
};

export default changeLanguage;
