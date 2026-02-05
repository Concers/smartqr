export declare class ShortCodeGenerator {
    private static readonly LENGTH;
    private static readonly ALPHABET;
    private static readonly ATTEMPTS;
    static generate(customCode?: string): Promise<string>;
    private static generateRandom;
    static isValidCode(code: string): boolean;
    static isAvailable(code: string): Promise<boolean>;
}
//# sourceMappingURL=shortCodeGenerator.d.ts.map