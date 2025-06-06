const names = {
    // Популярні імена
    'john': 'Іван', 'jane': 'Жанна', 'mary': 'Марія', 'mike': 'Михайло',
    'alex': 'Олекс', 'anna': 'Анна', 'kate': 'Катя', 'peter': 'Петро',
    'victoria': 'Вікторія', 'victor': 'Віктор', 'elena': 'Олена', 'denis': 'Денис',
    'maria': 'Марія', 'alexander': 'Олександр', 'alexandra': 'Олександра',
    'andrew': 'Андрій', 'michael': 'Михайло', 'nicholas': 'Микола', 'natalia': 'Наталія'
};

export function translateName(user) {
    if (!user) return 'Користувач';

    const name = user.firstName || user.fullName || 'Користувач';
    const lowerName = name.toLowerCase();

    // Шукаємо переклад
    for (const [eng, ukr] of Object.entries(names)) {
        if (lowerName.includes(eng)) {
            return ukr;
        }
    }

    return name; // якщо не знайшли - повертаємо оригінал
}

// Використання в Header.jsx:
// import { translateName } from '@/utils/translateName'
// const translatedName = translateName(user);
// Привіт, {translatedName}!

// Використання в Dashboard.jsx:
// import { translateName } from '@/utils/translateName'
// const translatedName = translateName(user);
// Привіт, {translatedName} ✌️