import { ZTypedocConfigBuilder } from "@zthun/janitor-build-config/typedoc";

export default new ZTypedocConfigBuilder()
  .web()
  .entry("../*")
  .name("Crumbtrail")
  .favicon("public/images/png/crumbtrail_32x32.png")
  .build();
