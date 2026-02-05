export interface StoredFile {
    key: string;
    publicUrl: string;
}
export interface StorageProvider {
    savePng(params: {
        key: string;
        buffer: Buffer;
    }): Promise<StoredFile>;
}
export declare class LocalStorageProvider implements StorageProvider {
    savePng(params: {
        key: string;
        buffer: Buffer;
    }): Promise<StoredFile>;
}
export declare const storage: StorageProvider;
//# sourceMappingURL=storageService.d.ts.map