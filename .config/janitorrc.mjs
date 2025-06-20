import {
  ZJanitorOptionsBuilder,
  ZJanitorOptionsLintBuilder,
} from "@zthun/janitor-options";

const lint = new ZJanitorOptionsLintBuilder()
  .commonEsFiles()
  .commonMarkdownFiles()
  .commonJsonFiles()
  .commonYamlFiles()
  .commonExcludes()
  .generatePrettyFiles()
  .generateSpellingFiles()
  .build();

export default new ZJanitorOptionsBuilder().lint(lint).build();
