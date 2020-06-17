
module.exports = {
    env: {
        test: {
            presets: [[
                '@babel/preset-env',
                {
                    targets: {
                        node: 'current'
                    }
                }
            ]]
        },
        prod: {
            presets: [
                ['@babel/preset-env', {
                    useBuiltIns: 'usage',
                    corejs: 3
                }]
            ],
            plugins: [
                '@babel/plugin-syntax-dynamic-import',
                ['@babel/plugin-transform-runtime', {
                    useESModules: true
                }]
            ]
        }
    }
};
