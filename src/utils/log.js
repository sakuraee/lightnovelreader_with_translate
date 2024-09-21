const log = {
    info: (str) => {
        if (process.env.NODE_ENV !== 'development') {
            return;
        }
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] ${str}`);
    },
    error: (str) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [ERROR] ${str}`);
    }
};

export default log;