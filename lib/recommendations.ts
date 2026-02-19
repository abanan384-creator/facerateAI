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
            "**Лимфодренажный массаж** - Ежедневный массаж лица для снятия отёков (5-10 минут утром)",
            "**Жевательные тренировки** - Специальные жвачки (Mastic Gum, Falim) для накачки массетеров",
            "**Mewing** - Правильное положение языка на нёбе 24/7 для изменения структуры лица",
            "**Снижение процента жира** - Если >15% жира, начните с диеты и кардио",
            "**Контуринг бороды** - Визуально подчеркните линию челюсти правильной формой бороды"
        ],
        difficulty: 'medium',
        timeframe: '3-12 месяцев'
    },

    cheekbones: {
        title: "Развитие скул",
        problem: "Слабо выраженные скулы могут быть результатом генетики, отёков или недостаточного развития костной структуры",
        solutions: [
            "**Снижение жира на лице** - Кардио + диета для проявления костной структуры",
            "**Лимфодренаж** - Массаж от центра лица к ушам для снятия отёков",
            "**Mewing** - Давление языка на нёбо способствует расширению верхней челюсти",
            "**Упражнения для скул** - Надувание щёк с сопротивлением (3x20 повторений)",
            "**Контуринг** - Макияж/тональный крем для визуального подчёркивания скул",
            "**Филлеры** - Гиалуроновая кислота (быстрый, но временный эффект)"
        ],
        difficulty: 'medium',
        timeframe: '2-8 месяцев'
    },



    masculinity: {
        title: "Повышение маскулинности",
        problem: "Недостаточно выраженные маскулинные черты лица (широкая челюсть, угловатость)",
        solutions: [
            "**Тренировка челюсти** - Жевательные упражнения для массетеров",
            "**Снижение жира** - Цель <12% для максимальной дефиниции",
            "**Тестостерон** - Силовые тренировки, сон 8ч, цинк, витамин D",
            "**Минимизация эстрогенов** - Избегайте пластик, сою, алкоголь",
            "**Mewing** - Для forward growth лица",
            "**Борода** - Добавляет маскулинность (если растёт)"
        ],
        difficulty: 'hard',
        timeframe: '6-24 месяцев'
    },

    eyes: {
        title: "Улучшение эстетики глаз",
        problem: "Низкий балл глаз может быть связан с отрицательным кантозальным наклоном, большой высотой века или неправильным расстоянием между глазами",
        solutions: [
            "**Уход за кожей** - Кремы с ретинолом и кофеином против тёмных кругов и мешков",
            "**Холодные компрессы** - Утром для уменьшения отёчности и подтяжки век",
            "**Squinting/Hunter Eyes exercises** - Легкое прищуривание нижним веком для укрепления круговой мышцы глаза",
            "**Массаж Гуаша** - Лимфодренаж вокруг глаз для улучшения контуров",
            "**Сон и гидратация** - Минимум 7-8 часов сна и 2л воды для свежего взгляда",
            "**Кантопластика** - Хирургическая коррекция наклона глаз (радикально)"
        ],
        difficulty: 'medium',
        timeframe: '1-6 месяцев'
    },

    facial_thirds: {
        title: "Коррекция пропорций лица",
        problem: "Непропорциональные трети лица (верхняя/средняя/нижняя зоны не равны)",
        solutions: [
            "**Причёска** - Визуально скорректируйте верхнюю треть (чёлка/объём)",
            "**Борода** - Удлините нижнюю треть с помощью формы бороды",
            "**Mewing** - Долгосрочное изменение структуры лица (годы)",
            "**Макияж/контуринг** - Визуальная коррекция пропорций",
            "**Филлеры** - Добавление объёма в нужные зоны (подбородок, губы)",
            "**Хирургия** - Радикальный метод (ринопластика, гениопластика)"
        ],
        difficulty: 'hard',
        timeframe: '1-36 месяцев'
    },

    potential: {
        title: "Улучшение качества фото",
        problem: "Низкое качество фотографии снижает точность анализа",
        solutions: [
            "**Освещение** - Естественный свет от окна или кольцевая лампа",
            "**Камера** - Используйте заднюю камеру телефона (лучше качество)",
            "**Расстояние** - 1-1.5 метра от камеры для минимизации искажений",
            "**Фокус** - Убедитесь что лицо в фокусе (нажмите на экран)",
            "**Нейтральная экспрессия** - Расслабленное лицо, рот закрыт",
            "**Фон** - Однотонный фон без отвлекающих элементов"
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
}

import { AnalysisScores } from './state';

/**
 * Analyze scores and return insights
 */
export function analyzeScores(scores: AnalysisScores): {
    strengths: MetricInsight[];
    improvements: MetricInsight[];
} {
    const metrics: MetricInsight[] = [
        {
            metric: 'jawline',
            label: 'Jawline',
            value: scores.jawline,
            status: getStatus(scores.jawline),
        },
        {
            metric: 'cheekbones',
            label: 'Cheekbones',
            value: scores.cheekbones,
            status: getStatus(scores.cheekbones),
        },

        {
            metric: 'masculinity',
            label: 'Masculinity',
            value: scores.masculinity,
            status: getStatus(scores.masculinity),
        },
        {
            metric: 'eyes',
            label: 'Eyes',
            value: scores.eyes,
            status: getStatus(scores.eyes),
        },
        {
            metric: 'facial_thirds',
            label: 'Facial Thirds',
            value: scores.facial_thirds,
            status: getStatus(scores.facial_thirds),
        },
    ];

    // Add potential if it's significantly different from overall
    if (scores.potential > scores.jawline + 10 ||
        scores.potential > scores.masculinity + 10) {
        metrics.push({
            metric: 'potential',
            label: 'Photo Quality',
            value: scores.potential,
            status: getStatus(scores.potential),
        });
    }

    // Sort by value
    const sorted = [...metrics].sort((a, b) => b.value - a.value);

    // Top metrics are strengths, bottom metrics are improvements
    const strengths = sorted.filter(m => m.status === 'excellent' || m.status === 'good');
    const improvements = sorted.filter(m => m.status === 'needs_improvement' || m.status === 'average');

    return { strengths, improvements };
}

function getStatus(value: number): 'excellent' | 'good' | 'average' | 'needs_improvement' {
    if (value >= 80) return 'excellent';
    if (value >= 65) return 'good';
    if (value >= 50) return 'average';
    return 'needs_improvement';
}
