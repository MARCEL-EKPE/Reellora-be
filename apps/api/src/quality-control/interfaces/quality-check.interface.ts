export interface QualityCheckResult {
    passed: boolean;
    checks: Record<string, unknown>;
    errorMessage?: string;
}
