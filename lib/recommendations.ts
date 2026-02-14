/**
 * Recommendations Database
 * Provides actionable advice for each facial metric
 */

export interface Recommendation {
    title: string;
    problem: string;
    solutions: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: string;
}

export const RECOMMENDATIONS: Record<string, Recommendation> = {
    jawline: {
        title: "Улучшение линии челюсти",
        problem: "Недостаточно выраженная линия челюсти может быть связана с отёками, жировыми отложениями или слабыми жевательными мышцами",
        solutions: [
            "🔹 **Лимфодренажный массаж** - Ежедневный массаж лица для снятия отёков (5-10 минут утром)",
            "🔹 **Жевательные тренировки** - Специальные жвачки (Mastic Gum, Falim) для накачки массетеров",
            "🔹 **Mewing** - Правильное положение языка на нёбе 24/7 для изменения структуры лица",
            "🔹 **Снижение процента жира** - Если >15% жира, начните с диеты и кардио",
            "🔹 **Контуринг бороды** - Визуально подчеркните линию челюсти правильной формой бороды"
        ],
        difficulty: 'medium',
        timeframe: '3-12 месяцев'
    },

    cheekbones: {
        title: "Развитие скул",
        problem: "Слабо выраженные скулы могут быть результатом генетики, отёков или недостаточного развития костной структуры",
        solutions: [
            "🔹 **Снижение жира на лице** - Кардио + диета для проявления костной структуры",
            "🔹 **Лимфодренаж** - Массаж от центра лица к ушам для снятия отёков",
            "🔹 **Mewing** - Давление языка на нёбо способствует расширению верхней челюсти",
            "🔹 **Упражнения для скул** - Надувание щёк с сопротивлением (3x20 повторений)",
            "🔹 **Контуринг** - Макияж/тональный крем для визуального подчёркивания скул",
            "🔹 **Филлеры** - Гиалуроновая кислота (быстрый, но временный эффект)"
        ],
        difficulty: 'medium',
        timeframe: '2-8 месяцев'
    },

    skin_quality: {
        title: "Улучшение качества кожи",
        problem: "Проблемы с кожей: текстура, покраснения, поры, акне или неровный тон",
        solutions: [
            "🔹 **Базовый уход** - Очищение → Тоник → Увлажнение (утро/вечер)",
            "🔹 **Третиноин (Ретин-А)** - Золотой стандарт для текстуры кожи и anti-age (требует рецепт)",
            "🔹 **Ниацинамид** - Сужение пор и выравнивание тона (The Ordinary 10%)",
            "🔹 **Витамин C** - Осветление пигментации и антиоксидантная защита",
            "🔹 **SPF 50+** - ОБЯЗАТЕЛЬНО каждый день для защиты от старения",
            "🔹 **Гидратация** - Минимум 2л воды в день",
            "🔹 **Сон** - 7-9 часов для регенерации кожи",
            "🔹 **Диета** - Исключите молочные продукты, сахар и обработанную пищу"
        ],
        difficulty: 'easy',
        timeframe: '1-6 месяцев'
    },

    masculinity: {
        title: "Повышение маскулинности",
        problem: "Недостаточно выраженные маскулинные черты лица (широкая челюсть, угловатость)",
        solutions: [
            "🔹 **Тренировка челюсти** - Жевательные упражнения для массетеров",
            "🔹 **Снижение жира** - Цель <12% для максимальной дефиниции",
            "🔹 **Тестостерон** - Силовые тренировки, сон 8ч, цинк, витамин D",
            "🔹 **Минимизация эстрогенов** - Избегайте пластик, сою, алкоголь",
            "🔹 **Mewing** - Для forward growth лица",
            "🔹 **Борода** - Добавляет маскулинность (если растёт)"
        ],
        difficulty: 'hard',
        timeframe: '6-24 месяцев'
    },

    facial_thirds: {
        title: "Коррекция пропорций лица",
        problem: "Непропорциональные трети лица (верхняя/средняя/нижняя зоны не равны)",
        solutions: [
            "🔹 **Причёска** - Визуально скорректируйте верхнюю треть (чёлка/объём)",
            "🔹 **Борода** - Удлините нижнюю треть с помощью формы бороды",
            "🔹 **Mewing** - Долгосрочное изменение структуры лица (годы)",
            "🔹 **Макияж/контуринг** - Визуальная коррекция пропорций",
            "🔹 **Филлеры** - Добавление объёма в нужные зоны (подбородок, губы)",
            "🔹 **Хирургия** - Радикальный метод (ринопластика, гениопластика)"
        ],
        difficulty: 'hard',
        timeframe: '1-36 месяцев'
    },

    potential: {
        title: "Улучшение качества фото",
        problem: "Низкое качество фотографии снижает точность анализа",
        solutions: [
            "🔹 **Освещение** - Естественный свет от окна или кольцевая лампа",
            "🔹 **Камера** - Используйте заднюю камеру телефона (лучше качество)",
            "🔹 **Расстояние** - 1-1.5 метра от камеры для минимизации искажений",
            "🔹 **Фокус** - Убедитесь что лицо в фокусе (нажмите на экран)",
            "🔹 **Нейтральная экспрессия** - Расслабленное лицо, рот закрыт",
            "🔹 **Фон** - Однотонный фон без отвлекающих элементов"
        ],
        difficulty: 'easy',
        timeframe: 'Немедленно'
    }
};

export interface MetricInsight {
    metric: string;
    label: string;
    value: number;
    status: 'excellent' | 'good' | 'average' | 'needs_improvement';
    emoji: string;
}

/**
 * Analyze scores and return insights
 */
export function analyzeScores(scores: {
    jawline: number;
    cheekbones: number;
    skin_quality: number;
    masculinity: number;
    facial_thirds: number;
    potential: number;
}): {
    strengths: MetricInsight[];
    improvements: MetricInsight[];
} {
    const metrics: MetricInsight[] = [
        {
            metric: 'jawline',
            label: 'Jawline',
            value: scores.jawline,
            status: getStatus(scores.jawline),
            emoji: '🗿'
        },
        {
            metric: 'cheekbones',
            label: 'Cheekbones',
            value: scores.cheekbones,
            status: getStatus(scores.cheekbones),
            emoji: '💎'
        },
        {
            metric: 'skin_quality',
            label: 'Skin Quality',
            value: scores.skin_quality,
            status: getStatus(scores.skin_quality),
            emoji: '✨'
        },
        {
            metric: 'masculinity',
            label: 'Masculinity',
            value: scores.masculinity,
            status: getStatus(scores.masculinity),
            emoji: '💪'
        },
        {
            metric: 'facial_thirds',
            label: 'Facial Thirds',
            value: scores.facial_thirds,
            status: getStatus(scores.facial_thirds),
            emoji: '📐'
        },
    ];

    // Add potential if it's significantly different from overall
    if (scores.potential > scores.jawline + 10 ||
        scores.potential > scores.skin_quality + 10) {
        metrics.push({
            metric: 'potential',
            label: 'Photo Quality',
            value: scores.potential,
            status: getStatus(scores.potential),
            emoji: '📸'
        });
    }

    // Sort by value
    const sorted = [...metrics].sort((a, b) => b.value - a.value);

    // Top 2-3 are strengths, bottom 2-3 are improvements
    const strengths = sorted.filter(m => m.status === 'excellent' || m.status === 'good').slice(0, 3);
    const improvements = sorted.filter(m => m.status === 'needs_improvement' || m.status === 'average').slice(-3);

    return { strengths, improvements };
}

function getStatus(value: number): 'excellent' | 'good' | 'average' | 'needs_improvement' {
    if (value >= 80) return 'excellent';
    if (value >= 65) return 'good';
    if (value >= 50) return 'average';
    return 'needs_improvement';
}
