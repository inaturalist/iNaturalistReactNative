### Source strings for iNaturalistReactNative
###
### Notes for Translators
### * See https://crowdin.com/project/inaturalistios/discussions/58 for notes
###   on this file format
###
### Notes for Developers
### * GroupComments (comments beginning w/ ##) are not allowed because all
###   strings in this file will be alphabetized and it's impossible to
###   determine where group comments should fit in.
### * Keys should match their content closesly but not exceed 100 chars
### * Try to annotate all strings with comments to provide context for
###   translators, especially for fragments and any situation where the
###   meaning is open to interpretation without context
### * Use different strings for synonyms, e.g. stop--noun and stop--verb, as
### * Use double dashes to make keys with the same values in English unique or
###   to otherwise annotate them, e.g. stop--noun or casual--quality-grade
###   these might have different translations in different languages
### * Accessibility hints are used by screen readers to describe what happens
###   when the user interacts with an element
###   (https://developer.apple.com/documentation/uikit/uiaccessibilityelement/1619585-accessibilityhint).
###   The iOS Guidelines defines it as "A string that briefly describes the
###   result of performing an action on the accessibility element." We write
###   them in third person singular ending with a period.

# Header for a general description, e.g. of a user, or of iNaturalist itself
ABOUT = О
# Label for button that shows all account settings
ACCOUNT-SETTINGS = НАСТРОЙКИ АККАУНТА
# Label for button that adds an identification of the same taxon as another identification
Agree = Согласен
# Label for button that adds an identification of the same taxon as another identification
AGREE = СОГЛАСЕН
ALL = ВСЕ
All = Все
All-observations = Все наблюдения
# As in intellectual property rights over a photo or other creative work
all-rights-reserved = Все права защищены
All-taxa = Все таксоны
# Month of April
April = Апрель
# Month of August
August = Август
Camera = Камера
Cancel = Отмена
# Quality grade indicating observation does not quality for Needs ID or
# Research Grade, e.g. missing media, voted out, etc.
Casual--quality-grade = Случайный
# Label for a button that clears content, like the text entered in a text
# field
Clear = Очистить
# Label for a button that closes a window or popup
Close = Закрыть
Collection-Project = Коллекционный проект
Community-Guidelines = Правила сообщества
# Notification when coordinates have been copied
Coordinates-copied-to-clipboard = Координаты скопированы в буфер обмена
# Data Quality Assessment section label: whether or not the observation date is accurate
Data-quality-assessment-date-is-accurate = Дата является точной
# Data Quality Assessment section label: whether or not the observation date was specified
Data-quality-assessment-date-specified = Указана дата
# Data Quality Assessment metric
Data-quality-assessment-evidence-of-organism = Свидетельство существования организма
# Data Quality Assessment metric
Data-quality-assessment-has-photos-or-sounds = С фото или со звуком
# Data Quality Assessment metric
Data-quality-assessment-id-supported-by-two-or-more = Поддержка идентификации двумя или более участниками
# Data Quality Assessment metric
Data-quality-assessment-location-is-accurate = Местоположение является точным
# Data Quality Assessment metric
Data-quality-assessment-location-specified = Указано местоположение
# Data Quality Assessment metric
Data-quality-assessment-organism-is-wild = Организм является диким
# Data Quality Assessment metric
Data-quality-assessment-recent-evidence-of-organism = Свежие свидетельства существования организма
# Data Quality Assessment metric
Data-quality-assessment-single-subject = Свидетельство, связанное с отдельным объектом
# Data Quality Assessment description of the final quality grade when Research Grade
Data-quality-assessment-title-research = Это наблюдение достигло исследовательского уровня!
# label in project requirements
Date = Дата
# Used when displaying a relative time - in this case, shows only month+year (same year) - e.g. Jul 3
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
date-format-month-day = d MMM
Date-observed = Дата наблюдения
Date-observed-header-short = Дата, время наблюдения
# Label for controls over a range of dates
Date-Range = Диапазон дат
# Express a date range. d1 and d2 can be any expression of dates
date-to-date = { $d1 } - { $d2 }
# Month of December
December = Декабрь
Delete-observation = Удалить наблюдения
# Button label or accessibility label for an element that deletes a photo
Delete-photo = Удалить фото
Device-storage-full = Память вашего устройства хранения  заполнена
Device-storage-full-description = iNaturalist не может более сохранять ваши фото, может произойти сбой.
DONATE = Поддержать
# Button for editing something
Edit = Редактировать
# Label for interactive element that takes you to a location choosing screen
Edit-location = Изменить местоположение
Edit-Observation = Редактировать наблюдение
Edit-your-profile-change-your-settings = Настройте ваш профиль, поменяйте при необходимости настройки уведомлений и управляйте другими  настройками вашего аккаунта
# Indicates a species only occurs in a specific place
Endemic = Эндемичный
# Title for a section describing an error
Error = Ошибка
# Title of dialog or section describing an error
Error-title = Ошибка
# Label in project requirements for a requirement related to Establishment
# Means, e.g. if a project only allowed observations of invasive species
Establishment = Возникновение
Exact-Date = Точная дата
except = за исключением
Explore = Поиск
# Header for featured projects
FEATURED = РЕКОМЕНДУЕМЫЕ
# Month of February
February = Февраль
Filter = Фильтр
Filters = Фильтры
Flag-An-Item = Отметить пункт
Flag-Item-Other-Description = Некоторые другие причины вы можете изложить ниже.
Flag-Item-Other-Input-Hint = Укажите причину, по которой вы помечаете этот элемент
# Status when an item has been flagged
Flagged = Помечено
# Subtitle for a screen showing the list of people a user is following
FOLLOWING-X-PEOPLE =
    { $count ->
        [one] НА ВАС ПОДПИСАН { $count } ЧЕЛОВЕК
       *[other] НА ВАС ПОДПИСАНО { $count } ЧЕЛОВЕК
    }
# Label for button that returns to the previous screen
Go-back = Назад
Hide = Скрыть
# Identification Status
ID-Withdrawn = Отзыв идентификации
Identifiers = Эксперты
# Explanation that observations are removed from a collection project
If-you-leave-x-of-your-observations-removed =
    Если вы покинете этот традиционный проект, { $count ->
        [one] 1 ваше наблюдение
       *[other] { $count } ваших наблюдений
    } также будут удалены из проекта.
# Identification category
improving--identification = Улучшающая
Introduced = Интродуцент
# Month of January
January = Январь
JOIN = ПРИСОЕДИНИТЬСЯ
# Asking for confirmation if the user wants to join this project
JOIN-PROJECT--question = ПРИСОЕДИНИТЬСЯ К ПРОЕКТУ?
# Header for joined projects
JOINED = ПРИСОЕДИНИЛИСЬ К
# Subtitle for a screen showing projects a user has joined
JOINED-X-PROJECTS =
    { $count ->
        [one] ПРИСОЕДИНИЛСЯ К ОДНОМУ { $count } ПРОЕКТУ
       *[other] ПРИСОЕДИНИЛСЯ К { $count } ПРОЕКТАМ
    }
# Month of July
July = Июль
# Month of June
June = Июнь
# Identification category
leading--identification = Ведущая
Learn-More = Узнать больше
# Asking for confirmation if the user wants to leave this project
LEAVE-PROJECT--question = ВЫЙТИ ИЗ ПРОЕКТА?
Location = Местоположение
# Second person imperative label to go to log in screen
Log-in = Вход
LOG-OUT = ВЫЙТИ
Map-Area = Карта области
# Month of March
March = Март
# Identification category
maverick--identification = Независимое мнение
# Month of May
May = Май
# label in project requirements
Media-Type = Тип медиафайла
# Accessibility label for a button that opens a menu of options
Menu = Меню
Missing-Date = Отсутствует дата
Months = Месяцы
MY-OBSERVATIONS = МОИ НАБЛЮДЕНИЯ
Native = Естественный
# Header or button label for content that is near the user's current location
NEARBY = ПОБЛИЗОСТИ
# Header or button label for content that is near the user's current location
Nearby = Около
# Quality grade indicating observation still needs more identifications
Needs-ID--quality-grade = Требуется идентификация
# Heading when creating a new observation
New-Observation = Новые наблюдения
No-Location = Местоположение не указано
No-Media = Нет медиа
# Error message title when not enough storage space on device, e.g. when the
# disk is full and you try to save a photo
Not-enough-space-left-on-device = На устройстве недостаточно места
# Error message description when not enough storage space on device, e.g. when
# the disk is full and you try to save a photo
Not-enough-space-left-on-device-try-again = Для данной операции на устройстве не хватает места. Пожалуйста, освободите место и попробуйте ещё раз
Notifications = Уведомления
# Month of November
November = Ноябрь
Obscured = Скрытое
Observation = Наблюдение
Observations = Наблюдения
# Button that starts a new observation
Observe = Наблюдать
Observers = Наблюдатели
# Month of October
October = Октябрь
Offensive-Inappropriate = Оскорбительное / Неприемлемое
# Generic confirmation, e.g. button on a warning alert
OK = ОК
# Adjective, as in geoprivacy
Open = Открытое
# Generic option in a list for unanticipated cases, e.g. a choice to manually
# enter an explanation for why you are flagging something instead of choosing
# one of the existing options
Other = Другое
# Title showing user profile details about who a user follows and is following
PEOPLE--title = ЛЮДИ
Privacy-Policy = Политика конфиденциальности
Private = Частный
Project-Members-Only = Только участники проекта
project-start-time-datetime = Время начала: { $datetime }
# As in iNat projects, collections of observations or observation search filters
Projects = Проекты
PROJECTS-X = ПРОЕКТЫ ({ $projectCount })
# label in project requirements
Quality-Grade = Уровень наблюдения
# Screen reader label for the Casual quality grade label
Quality-Grade-Casual--label = Уровень качества: Обыкновенный
# Screen reader label for the Needs ID quality grade label
Quality-Grade-Needs-ID--label = Уровень качества: Требует идентификации
# Screen reader label for the Research quality grade label
Quality-Grade-Research--label = Уровень качества: Исследовательский
Ranks-Class = Класс
Ranks-Complex = Комплекс
Ranks-Epifamily = Эписемейство
Ranks-Family = Семейство
Ranks-Form = Форма
Ranks-Genus = Род
Ranks-Genushybrid = Genus hybrid (GeoPlanet)
Ranks-Hybrid = Гибрид
Ranks-Infraclass = Инфракласс
Ranks-Infrahybrid = Инфрагибрид
Ranks-Infraorder = Инфраотряд
Ranks-Kingdom = Царство
Ranks-Order = Отряд / порядок
Ranks-Parvorder = Парвотряд
Ranks-Phylum = Тип / отдел
Ranks-Section = Секция
Ranks-SPECIES = ВИДЫ
Ranks-Species = Видов
Ranks-Statefmatter = Форма
Ranks-Subclass = Подкласс
Ranks-Subfamily = Подсемейство
Ranks-Subgenus = Подрод
Ranks-Subkingdom = Подцарство
Ranks-Suborder = Подотряд
Ranks-Subphylum = Подтип / подотдел
Ranks-Subsection = Подсекция
Ranks-Subspecies = Подвид
Ranks-Subterclass = Надкласс
Ranks-Subtribe = Подтриба
Ranks-Superclass = Надкласс
Ranks-Superfamily = Надсемейство
Ranks-Superorder = Надотряд
Ranks-Supertribe = Надтриба
Ranks-Tribe = Триба
Ranks-Variety = Разновидность
Ranks-Zoosection = Зоосекция
Ranks-Zoosubsection = Зооподсекция
# Help text for the button that opens the sound recorder
Record-a-sound = Запишите аудио
# Imperative verb for recording a sound
Record-verb = Запись
# Label for button that removes an identification
Remove-identification = Удалить идентификацию
Remove-project-filter = Удалить фильтр по проекту
# Quality grade indicating observation is accurate and complete enough to
# share outside of iNat
Research-Grade--quality-grade = Исследовательский статус
# Label for a button that resets the state of an interface, e.g. a button that
# resets the sound recorder to its original state
Reset-verb = Сброс
# Label for button that restores a withdrawn identification
Restore = Восстановить
# Label for the satellite map type
Satellite--map-type = Спутник
# Label for a button that persists something
SAVE = СОХРАНИТЬ
# Label for a button that persists something
Save = Сохранить
Scientific-Name = Научное название
# Title for a search interface
Search = Поиск
# Accessibility label for navigating to project members screen
See-project-members = Посмотреть список участников проекта
# Month of September
September = Сентябрь
Share = Поделиться
Share-location = Поделиться местоположением
Sounds = Звуки
Spam = Спам
Spam-Examples = Коммерческие предложения, ссылки в никуда и т. д.
Species = Видов
# Label for the standard map type
Standard--map-type = Стандартный
# Imperative verb for stopping the recording of a sound
Stop-verb = Остановить
# Identification category
supporting--identification = Поддерживающая
Syncing = Синхронизация...
# Help text for the button that opens the multi-capture camera
Take-multiple-photos-of-a-single-organism = Сделайте несколько фото отдельного организма
# label in project requirements
Taxa = Таксоны
Terms-of-Use = Условия использования
# Describes what happens when geoprivacy is set to private
The-location-will-not-be-visible-to-others = Местоположение не будет видимым для других, это может препятствовать идентификации организма
The-models-that-suggest-species = Модели, предполагающие виды на основе визуального сходства и местоположения, были созданы отчасти благодаря сотрудничеству с Сарой Бири, Томом Бруксом, Элайджей Коулом, Кристианом Ланге, Ойсином Мак Аодой, Пьетро Пероной и Грантом Ван Хорном.
Traditional-Project = Традиционный проект
Umbrella-Project = Зонтичный проект
# Text to show when a taoxn rank is unknown or missing
Unknown--rank = Неизвестно
# Text to show when a taxon or identification is unknown or missing
Unknown--taxon = Неизвестно
# Text to show when a user (or their name) is unknown or missing
Unknown--user = Неизвестно
# Generic error message
Unknown-error = Неизвестная ошибка
# label in project requirements
Users = Пользователи
# Button on user profile that displays a list of users that follow that user
VIEW-FOLLOWERS = ПОСМОТРЕТЬ ТЕХ, КТО НА ВАС ПОДПИСАН
# Button on user profile that displays a list of users that the user is following
VIEW-FOLLOWING = ПОСМОТРЕТЬ ТЕХ, НА КОГО ВЫ ПОДПИСАНЫ
View-in-browser = Просмотр в браузере
# Label for a button that shows identification suggestions for an observation
# or photo
View-suggestions = Посмотреть предложения
Welcome-to-iNaturalist = Добро пожаловать на iNaturalist!
Wild = Дикий
# Label for a button that withdraws an identification
Withdraw = Отозвать
Worldwide = По всему миру
# Subtitle for a screen showing the list of followers a user has
X-FOLLOWERS =
    { $count ->
        [one] { $count } ПОДПИСАВШИЙСЯ
       *[other] { $count } ПОДПИСАВШИХСЯ
    }
# Subheader for number of project members screen
X-MEMBERS = { $count }  УЧАСТНИКОВ
# Progress or position indicator, e.g. when viewing 2 of 3 observations, or 3
# of 10 photos
X-of-Y =
    { $x ->
        [one] 1
       *[other] { $x }
    } { $y ->
        [one] of { $y }
       *[other] of { $y }
    }
X-PROJECTS =
    { $projectCount ->
        [one] { $projectCount } ПРОЕКТ
        [two] { $projectCount } ПРОЕКТА
        [few] { $projectCount } ПРОЕКТОВ
       *[other] { $projectCount } ПРОЕКТОВ
    }
# Displays number of sounds attached to an observation in the Media Viewer
X-SOUNDS =
    { $count ->
        [one] 1 АУДИО
       *[other] { $count } АУДИО
    }
X-Species =
    { $count ->
        [one] { $count } Вид
       *[other] { $count } Видов
    }
x-uploads-failed =
    { $count ->
        [one] { $count } выгрузка не удалась
       *[other] { $count } выгрузок не удалось
    }
Yes-license-my-photos = Да, предоставьте лицензию на мои фото, аудио и наблюдения, чтобы ученые могли использовать мои данные (рекомендуется).
You-are-offline = Вы не в сети
You-are-offline-Tap-to-reload = Вы не в сети. Нажмите для перезагрузки.
You-are-offline-Tap-to-try-again = Вы не в сети. Нажмите ещё раз для перезагрузки.
You-can-add-up-to-20-media = Вы можете добавлять до 20 фото и 20 аудио в одно наблюдение.
You-can-also-check-out-merchandise = Вы также можете посмотреть товары для iNaturalist и Seek в нашем магазине (ниже)!
You-can-also-explore-existing-observations = Вы также можете изучить имеющиеся наблюдения на iNaturalist, чтобы выяснить, что находится вокруг вас.
You-can-click-join-on-the-project-page = Вы можете нажать "присоединиться" на странице проекта.
You-can-find-answers-on-our-help-page = Ответы на вопросы можно найти на нашей страничке помощи.
You-can-only-add-20-photos-per-observation = Вы можете добавлять только 20 фото в одно наблюдение
# Onboarding text on MyObservations: Onboarding text on MyObservations: 51-100 observations
You-can-search-observations-of-any-plant-or-animal = Через меню Поиск вы можете искать наблюдения любого растения или животного в любой точке мира!
You-can-still-share-the-file = Вы можете поделиться файлом с другим приложением. Если вы можете отправить его по электронной почте, пожалуйста, отправьте его на { $email }
You-can-upload-this-observation-to-our-community = Вы можете загрузить это наблюдение в наше сообщество, чтобы получить идентификацию от реального человека и помочь нашему ИИ улучшить свои идентификационные данные в будущем.
You-changed-filters-will-be-discarded = Вы изменили фильтры, но они не были применены к результатам поиска по запросу.
You-have-opted-out-of-the-Community-Taxon = Вы отказались от таксона сообщества
You-havent-joined-any-projects-yet = Вы еще не присоединились ни к каким проектам.
You-must-be-logged-in-to-view-messages = Вы должны войти в систему для просмотра ваших сообщений.
# Error message when you try to do something that requires an Internet
# connection but such a connection is, tragically, missing
You-need-an-Internet-connection-to-do-that = Для этого необходимо подключение к Интернету.
# Error message when you try to do something that requires log in
You-need-log-in-to-do-that = Чтобы сделать это, авторизуйтесь
You-will-see-notifications = Как только войдете в систему и загрузите наблюдения, вы увидите здесь уведомления .
Your-donation-to-iNaturalist = Ваше пожертвование в пользу iNaturalist поможет улучшить и стабилизировать работу мобильных приложений и веб-сайта, которые связывают миллионы людей с природой и обеспечивают защиту биоразнообразия во всем мире!
Your-email-is-confirmed = Ваш адрес электронной почты подтвержден! Пожалуйста, войдите для продолжения.
Your-location-uncertainty-is-over-x-km = Неопределенность вашего местоположения превышает { $x } км, что слишком много, чтобы помочь экспертам. Отредактируйте местоположение и масштаб до тех пор, пока круг точности не приобретёт зеленый цвет и не центрируется на том  месте, где вы наблюдали за организмом.
Youre-always-in-control-of-the-location-privacy = Вы всегда контролируете конфиденциальность местоположения каждого создаваемого вами наблюдения.
# Text prompting the user to open Settings to grant permission after
# permission has been denied
Youve-denied-permission-prompt = Вам отказано в разрешении. Пожалуйста, задайте разрешение в настройках приложения.
Youve-previously-denied-camera-permissions = Вы ранее запретили доступ к камере, поэтому включите доступ к ней в настройках.
Youve-previously-denied-gallery-permissions = Вы ранее запретили доступ к галерее фото, поэтому включите доступ к ней в настройках.
Youve-previously-denied-location-permissions = Вы ранее запретили доступ к местоположению, поэтому включите доступ к нему в настройках.
Youve-previously-denied-microphone-permissions = Вы ранее запретили доступ к микрофону, поэтому включите доступ к нему в настройках.
Zoom-in-as-much-as-possible-to-improve = Увеличьте масштаб в максимально возможной степени, чтобы улучшить точность местоположения и улучшить идентификацию.
Zoom-to-current-location = Перейдите к текущему местоположению
# Label for button that shows zoom level, e.g. on a camera
zoom-x = { $zoom }×
