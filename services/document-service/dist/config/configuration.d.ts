declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    upload: {
        dir: string;
        maxSize: number;
        allowedTypes: string[];
        allowedExtensions: string[];
    };
};
export default _default;
