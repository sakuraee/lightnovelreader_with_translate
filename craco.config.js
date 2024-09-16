module.exports = {
    // ...
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "path": require.resolve("path-browserify") // 为path模块指定后备
                  },
            },
        }
    }
};