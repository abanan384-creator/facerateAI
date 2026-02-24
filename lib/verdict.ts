import { AnalysisScores, Mode } from './state';
import { analyzeScores } from './recommendations';

export interface FinalVerdict {
    summary: string;
    primaryFocus: string;
    overallRating: 'elite' | 'high' | 'solid' | 'potential';
}

export function generateVerdict(scores: AnalysisScores, mode: Mode = 'front'): FinalVerdict {
    const { strengths, improvements } = analyzeScores(scores, mode);

    let summary = "";
    let primaryFocus = "";
    let overallRating: FinalVerdict['overallRating'] = 'solid';

    const avg = scores.overall;

    if (avg >= 85) {
        overallRating = 'elite';
        summary = "У вас выдающиеся внешние данные с отличными пропорциями. Основной акцент должен быть на поддержании текущей формы.";
    } else if (avg >= 70) {
        overallRating = 'high';
        summary = "Ваш потенциал значительно выше среднего. У вас есть несколько сильных черт, которые выделяют вас.";
    } else if (avg >= 55) {
        overallRating = 'solid';
        summary = "Хорошая база. При целенаправленной работе над зонами роста вы можете значительно улучшить свой результат.";
    } else {
        overallRating = 'potential';
        summary = "Есть много возможностей для улучшения. Начав с базовых рекомендаций, вы увидите прогресс уже через пару месяцев.";
    }

    if (improvements.length > 0) {
        primaryFocus = `Ваша главная цель — ${improvements[0].label.toLowerCase()}. Это даст самый заметный эффект.`;
    } else {
        primaryFocus = "Продолжайте работать над детализацией и общим тонусом лица.";
    }

    return { summary, primaryFocus, overallRating };
}
