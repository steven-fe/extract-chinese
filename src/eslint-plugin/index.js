import {
  statisticalEntry,
  createEntryInfo,
  findTemplateLiteral,
  replaceText,
  unmatchedIdentifier,
} from "./tools.js";
import {
  handleEntryInfo,
  manualProcessNode,
  setAutoProcessTextSet,
  setManualProcessTextMap,
} from "./utils.js";

export const meta = {
  name: "eslint-plugin-coinstore",
  version: "0.0.1",
};

export default {
  rules: {
    "replace-language": {
      meta: {
        /*
         "problem"表示规则正在标识将导致错误或可能导致混淆行为的代码。开发人员应将此视为高度优先解决的问题。
        "suggestion"意味着规则正在识别可以以更好的方式完成的事情，但如果不更改代码就不会发生错误。
        "layout"意味着规则主要关心空格、分号、逗号和括号，程序的所有部分决定代码的外观而不是代码的执行方式。这些规则适用于 AST 中未指定的部分代码。
                * */
        type: "suggestion",
        // 定义提示信息文本 error-name为提示文本的名称 定义后我们可以在规则内部使用这个名称
        messages: {
          // 'error-name': '这是一个错误的命名',
        },
        docs: {
          description: "检测使用了中文并进行提取",
        },
        // 标识这条规则是否可以修复，假如没有这属性，即使你在下面那个create方法里实现了fix功能，eslint也不会帮你修复
        fixable: "code",
        // 这里定义了这条规则需要的参数
        // 比如我们是这样使用带参数的rule的时候，rules: { myRule: ['error', param1, param2....]}
        // error后面的就是参数，而参数就是在这里定义的
        schema: [],
      },
      create(context) {
        // 原始ast方式
        // return {
        //   // 在ReturnStatement节点上
        //   ReturnStatement(node) {},
        //   // 在开始分析代码路径时
        //   onCodePathStart(codePath, node) {
        //     // console.log(codePath, node)
        //   },
        //   // 在分析代码路径结束时
        //   onCodePathEnd(codePath, node) {},
        //   // onCodePathSegmentStart(segment, node) {},
        //   // onCodePathSegmentEnd(segment, node) {},
        //   // onCodePathSegmentLoop(fromSegment, toSegment, node) {},
        // }
        // vue解析器提供的方式
        return context.parserServices.defineTemplateBodyVisitor(
          // <template>部分走这里
          /* 存在的节点类型,ast原生类型未列出
            VAttribute: ["key", "value"],
            VDirectiveKey: ["name", "argument", "modifiers"],
            VDocumentFragment: ["children"],
            VElement: ["startTag", "children", "endTag"],
            VEndTag: [],
            VExpressionContainer: ["expression"],
            VFilter: ["callee", "arguments"],
            VFilterSequenceExpression: ["expression", "filters"],
            VForExpression: ["left", "right"],
            VIdentifier: [],
            VLiteral: [],
            VOnExpression: ["body"],
            VSlotScopeExpression: ["params"],
            VStartTag: ["attributes"],
            VText: [],*/
          {
            TemplateElement(node) {
              /**
               * <el-row :gutter="`事123.${Math.random > 0.5 ? '时123' : '事'}`">
               * to:
               * <el-row :gutter="`${$t(事123.)}${Math.random > 0.5 ? '时123' : '事'}`">
               */

              handleEntryInfo(context, node, node.value.raw, (entryInfo) => {});
            },
            Literal(node) {
              /**
               * <div>{{ Math.random() > 0.5 ? '否' : '是' }}</div>
               * to:
               * <div>{{ Math.random() > 0.5 ? $t('否') : $('是') }}</div>
               */

              {
                /**
                 * if (node.parent === $t('Language_Key')) return
                 */
                const parent = node?.parent;
                if (parent && parent.type === "CallExpression") {
                  if (
                    parent.callee.type === "Identifier" &&
                    unmatchedIdentifier(parent.callee.name)
                  )
                    return;
                }
              }

              handleEntryInfo(context, node, node.value, (entryInfo) =>
                replaceText({
                  node,
                  entryInfo,
                  context,
                  replaceType: "vueTemplate",
                }),
              );
            },
            VLiteral(node) {
              /**
               * <div style="VLiteral"></div>
               * to:
               * <div :style="$t('VLiteral_Key')"></div>
               *
               * tips: cannot startsWith :
               */

              // console.log(
              //   `VLiteral value - ${node.value} | state - ${
              //     entryInfo.state !== 2
              //   } | loc - ${JSON.stringify(node.loc)}`,
              // )

              // 父级节点需要改为冒号方式，传递父节点

              handleEntryInfo(context, node, node.value, (entryInfo) =>
                replaceText({
                  node: node.parent,
                  entryInfo,
                  context,
                  replaceType: "vueTemplate",
                }),
              );
            },
            VText(node) {
              /**
               * <div>VText</div>
               * to:
               * <div>{{ $t('VText_Key') }}</div>
               */

              // if (!node.value.startsWith('\n')) {
              //   console.log('VText value - ', node.value)
              // }

              handleEntryInfo(context, node, node.value, (entryInfo) =>
                replaceText({
                  node,
                  entryInfo,
                  context,
                  replaceType: "vueTemplate",
                }),
              );
            },
          },
          // Event handlers for <script> or scripts. (optional)
          // js，ts部分会走这里
          {
            // // 在开始分析代码路径时
            // onCodePathStart(codePath: string, node: any) {
            //   console.log(codePath, node)
            // },
            // // 最大的节点，最先出现的部分
            // Program(node: AST.ESLintProgram) {
            //   console.log(node)
            // },
            Literal(node) {
              const parent = node?.parent;

              switch (parent.type) {
                case "JSXAttribute": {
                  /**
                   * <Region placeholder="宛如请问" />
                   * to:
                   * <Region placeholder={$t('宛如请问')} />
                   */

                  handleEntryInfo(context, node, node.value, (entryInfo) =>
                    // 父级节点需要改为冒号方式，传递父节点
                    replaceText({
                      node: node.parent,
                      entryInfo,
                      context,
                      replaceType: "js",
                    }),
                  );
                  break;
                }

                default: {
                  /**
                   * <div>{{ Math.random() > 0.5 ? '否' : '是' }}</div>
                   * to:
                   * <div>{{ Math.random() > 0.5 ? $t('否') : $('是') }}</div>
                   */

                  {
                    /**
                     * if (node.parent === this.$t('Language_Key')) return
                     */
                    if (parent?.type === "CallExpression") {
                      if (
                        parent.callee.type === "MemberExpression" &&
                        unmatchedIdentifier(parent.callee.property.name)
                      )
                        return;
                    }
                  }

                  handleEntryInfo(context, node, node.value, (entryInfo) =>
                    replaceText({
                      node,
                      entryInfo,
                      context,
                      replaceType: "js",
                    }),
                  );
                }
              }
            },
            TemplateElement(node) {
              /**
               * <Region attr={`为而且宛如请问${Math.random() > 0.5 ? '是' : '否'}`} />
               * to:
               * <Region attr={`${this.$t('为而且宛如请问')}${Math.random() > 0.5 ? this.$t('是') : this.$t('否')}`} />
               */

              handleEntryInfo(context, node, node.value.raw, (entryInfo) => {});
            },
            JSXText(node) {
              /**
               * <p class={'tips'}>文案</p>
               * to:
               * <p class={'tips'}>{ $t('文案') }</p>
               */
              handleEntryInfo(context, node, node.value, (entryInfo) =>
                replaceText({
                  node,
                  entryInfo,
                  context,
                  replaceType: "js",
                }),
              );
            },
          },
          // Options. (optional)
          {
            templateBodyTriggerSelector: "Program:exit",
          },
        );
      },
    },
  },
  configs: {
    default: {
      plugins: ["coinstore"], // 插件的前缀名称
      rules: {
        "coinstore/replace-language": "error",
      },
    },
  },
};
