/**
 * 参考文档
 * 【eslint英文文档】https://eslint.org/docs/user-guide/configuring
 * 【eslint中文文档】https://eslint.cn/docs/rules/
 */

/**
 * eslint有三种使用方式
 * 【1】js代码中通过注释的方式使用
 * 【2】通过webpack的eslintConfig字段设置，eslint会自动搜索项目的package.json文件中的配置
 * 【3】通过配置文件的方式使用，配置文件有多种文件方式，如JavaScript、JSON 或者 YAML等
 */

/**
 * 文件忽略
 * 【】让eslint跳过特定文件的检测
 * 【】通过当前工作目录下 「.eslintignore」 文件进行设置
 *  其使用的是Glob路径书写方式，与「.gitignore」的使用方法相同
 * 【】也可以在 package.json 文件中，通过 eslintIgnore 参数进行设置
 */

/**
 * 文件内局部设置
 * 【】eslint可以具体文件中设置特定代码的规则，常用于跳过某条语句的检测。
 * 【】注销全部规则，在代码前新建一行，添加注销 /* eslint-disable *\/  。如果没有恢复设置的语句，则下列全部代码都会跳过检测。
 * 【】恢复eslint，在代码前新建一行，添加注销 /* eslint-enable *\/
 * 【】指定忽略的规则，/* eslint-disable no-alert, no-console *\/
 * 【】在特定行禁用，// eslint-disable-line
 * 【】在下一行禁用，// eslint-disable-next-line
 */
module.exports = {

    /**
     * 根目录标识
     * https://eslint.cn/docs/user-guide/configuring#using-configuration-files
     * https://eslint.cn/docs/user-guide/configuring#configuration-cascading-and-hierarchy
     * 【】标识当前配置文件为最底层的文件，无需往更上一级的文件目录中进行搜索
     * 【】默认eslint的配置文件搜索方式是，从目标文件夹进行搜索，遍历内部每一个文件夹，找到配置文件并层叠使用。再跳出本项目，往祖先文件夹进行遍历
     * 【】注意「~/.eslintrc」的意义，「~」是指linux上的家目录，「~/.eslintrc」是指家目录下的eslint配置文件，用于私人开发者，用于整个电脑全局约束的。这个配置通过本配置项root去设置，设置了root,eslint检测时将不会再往上搜索
     * 【】eslint的生效规则是就近使用，越近的配置项优先级越高，覆盖其他配置项。如一个项目中，可以在不同文件夹中都添加配置文件，这些规则将重叠组合生效
     */
    root: true,

    /**
     * 解析器
     * https://eslint.cn/docs/user-guide/configuring#specifying-parser
     * 【】ESLint 默认使用Espree作为其解析器
     * 【】解析器必须是本地安装的一个 npm 模块。即必须按照在本地的node_module中
     * 【】解析器是用于解析js代码的，怎么去理解每一个表达式，有点C++中编译器的概念，会对js进行一些语法分析，语义分析什么的，才能判断语句符不符合规范。而不是通过简单的字符串对比。
     * 【】解析器有很多，但兼容eslint的解析器有以下几个
     * Espree：默认解析器，一个从Esprima中分离出来的解析器，做了一些优化
     * Esprima：js标准解析器
     * Babel-ESLint： 一个对Babel解析器的包装，babel本身也是js解析器的一种（不然怎么能转化为兼容性代码呢？首先需要进行js解析，才能转化）。如果我们的代码需要经过babel转化，则对应使用这个解析器
     * typescript-eslint-parser(实验) - 一个把 TypeScript 转换为 ESTree 兼容格式的解析器
     */
    parser: 'vue-eslint-parser',

    /**
     * 解析器配置项
     * https://eslint.cn/docs/user-guide/configuring#specifying-parser-options
     * 【】这里设置的配置项将会传递到解析器中，被解析器获取到，进行一定的处理。具体被利用到，要看解析器的源码有没有对其进行利用。这里仅仅做了参数定义，做了规定，告诉解析器的开发者可能有这些参数
     * 【】配置项目有：
     * 'sourceType': 'module',  // 指定JS代码来源的类型，script(script标签引入？) | module（es6的module模块），默认为script。为什么vue的会使用script呢？因为vue是通过babel-loader编译的，而babel编译后的代码就是script方式
     * 'ecmaVersion': 6,     // 支持的ES语法版本，默认为5。注意只是语法，不包括ES的全局变量。全局变量需要在env选项中进行定义
     * 'ecmaFeatures': {     // Features是特征的意思，这里用于指定要使用其他那些语言对象
       'experimentalObjectRestSpread': true, //启用对对象的扩展
       'jsx': true,              //启用jsx语法
       'globalReturn':true,          //允许return在全局使用
       'impliedStrict':true          //启用严格校验模式
      }
     */
    parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module',
    },

    /**
     * 运行环境
     * https://eslint.cn/docs/user-guide/configuring#specifying-environments
     * 【】一个环境定义了一组预定义的全局变量
     * 【】获得了特定环境的全局定义，就不会认为是开发定义的，跳过对其的定义检测。否则会被认为改变量未定义
     * 【】常见的运行环境有以下这些，更多的可查看官网
     * browser - 浏览器环境中的全局变量。
     * node - Node.js 全局变量和 Node.js 作用域。
     * es6 - 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6）。
     * amd - 将 require() 和 define() 定义为像 amd 一样的全局变量。
     * commonjs - CommonJS 全局变量和 CommonJS 作用域 (用于 Browserify/WebPack 打包的只在浏览器中运行的代码)。
     * jquery - jQuery 全局变量。
     * mongo - MongoDB 全局变量。
     * worker - Web Workers 全局变量。
     * serviceworker - Service Worker 全局变量。
     */
    env: {
        browser: true,
    },

    /**
     * 插件
     * https://eslint.cn/docs/user-guide/configuring#configuring-plugins
     * 【】插件同样需要在node_module中下载
     * 【】注意插件名忽略了「eslint-plugin-」前缀，所以在package.json中，对应的项目名是「eslint-plugin-vue」
     * 【】插件的作用类似于解析器，用以扩展解析器的功能，用于检测非常规的js代码。也可能会新增一些特定的规则。
     * 【】如 eslint-plugin-vue，是为了帮助我们检测.vue文件中 <template> 和 <script> 中的js代码
     */
    plugins: [
        'vue'
    ],

    /**
     * 定义全局中的变量
     * 在 script-setup 模式下，新增了 4 个全局编译器宏，他们无需 import 就可以直接使用
     * defineProps、defineEmits、defineExpose、withDefaults
     */
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        ElMessage: 'readonly',
    },

    /**
     * 规则继承
     * https://eslint.cn/docs/user-guide/configuring#extending-configuration-files
     *【】可继承的方式有以下几种
     *【】eslint内置推荐规则，就只有一个，即「eslint:recommended」
     *【】可共享的配置， 是一个 npm 包，它输出一个配置对象。即通过npm安装到node_module中
     *  可共享的配置可以省略包名的前缀 eslint-config-，即实际设置安装的包名是 eslint-config-airbnb-base
     *【】从插件中获取的规则，书写规则为 「plugin:插件包名/配置名」，其中插件报名也是可以忽略「eslint-plugin-」前缀。如'plugin:vue/essential'
     *【】从配置文件中继承，即继承另外的一个配置文件，如'./node_modules/coding-standard/eslintDefaults.js'
     */
    extends: [
        // add more generic rulesets here, such as:
        // 'eslint:recommended',
        'plugin:vue/vue3-essential',
        'eslint:recommended'
    ],

    /**
     * 规则共享参数
     * https://eslint.cn/docs/user-guide/configuring#adding-shared-settings
     * 【】提供给具体规则项，每个参数值，每个规则项都会被注入该变量，但对应规则而言，有没有用，就看各个规则的设置了，就好比 parserOptions，解析器用不用它就不知道了。这里只是提供这个方法
     * 【】不用怀疑，经源码验证，这就是传递给每个规则项的，会当做参数传递过去，但用不用，就是具体规则的事情
     */
    settings: {
    },

    /**
     * 针对特定文件的配置
     * 【】可以通过overrides对特定文件进行特定的eslint检测
     * 【】特定文件的路径书写使用Glob格式，一个类似正则的路径规则，可以匹配不同的文件
     * 【】配置几乎与 ESLint 的其他配置相同。覆盖块可以包含常规配置中的除了 extends、overrides 和 root 之外的其他任何有效配置选项，
     */
    overrides: [
    ],

    /**
     * 自定义规则
     * https://eslint.cn/docs/user-guide/configuring#configuring-rules
     * 【】基本使用方式
     * 'off' 或者0 关闭规则
     * 'warn' 或者1 将规则打开为警告（不影响退出代码）
     * 'error' 或者2 将规则打开为错误（触发时退出代码为1）
     * 如：'no-restricted-syntax': 0, // 表示关闭该规则
     * 【】如果某项规则，有额外的选项，可以通过数组进行传递，而数组的第一位必须是错误级别。如0,1,2
     * 如 'semi': ['error', 'never'], never就是额外的配置项
     */
    rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
    }
}