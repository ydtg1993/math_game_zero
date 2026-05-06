import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',                     // 输出 ES 模块，与 script type="module" 兼容
        entryFileNames: 'index.js',
        preserveModules: true,            // 保持原有文件结构
        preserveModulesRoot: 'src',
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false,             // 不需要生成 .d.ts
        }),
        copy({
            targets: [
                { src: 'index.html', dest: 'dist' }
            ]
        })
    ]
};