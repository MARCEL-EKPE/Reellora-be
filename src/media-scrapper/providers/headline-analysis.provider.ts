import { Injectable } from '@nestjs/common';
import { PROGRAM_PATTERNS, CONFLICT_KEYWORDS, GOVERNMENT_KEYWORDS, ECONOMIC_KEYWORDS, COUNTRY_KEYWORDS, } from '../constants/patterns-keywords';

@Injectable()
export class HeadlineAnalysisProvider {

    calculateScore(title: string): number {
        let score = 0;

        const lower = title.toLowerCase();

        if (PROGRAM_PATTERNS.some(p => p.test(lower))) {
            score -= 6;
        }

        for (const word of CONFLICT_KEYWORDS) {
            if (lower.includes(word)) {
                score += 3;
            }
        }

        for (const word of GOVERNMENT_KEYWORDS) {
            if (lower.includes(word)) {
                score += 2;
            }
        }

        for (const word of ECONOMIC_KEYWORDS) {
            if (lower.includes(word)) {
                score += 1.5;
            }
        }

        for (const country of COUNTRY_KEYWORDS) {
            if (lower.includes(country)) {
                score += 2;
            }
        }

        if (/\d+/.test(title)) {
            score += 2;
        }

        if (title.trim().endsWith('?')) {
            score -= 2;
        }

        return score;
    }
}