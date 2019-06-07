import * as gulp from "gulp";
import { project } from "@wasm/studio-utils";
import { transpile } from "@iceteachain/sunseed";
import { IceteaWeb3 } from "@iceteachain/web3";

gulp.task("build", async () => {
  const storeSrc = project.getFile("src/simplestore.djs");
  const store = await transpile(storeSrc.getData(), {
    prettier: true,
    project,
    context: "src"
  });

  const storeJs = project.newFile("out/simplestore.js", "javascript", true);
  storeJs.setData(store);
});

gulp.task("deploy", async () => {
  const tweb3 = new IceteaWeb3("https://rpc.icetea.io");
  
  // Create a new account to deploy
  // To use existing account, use tweb3.wallet.importAccount(privateKey)
  tweb3.wallet.createAccount()

  const storeSrc = project.getFile("out/simplestore.js");
  if (!storeSrc) {
    throw new Error("You need to build the project first.");
  }
  const result = await tweb3.deployJs(storeSrc.getData());
  logLn("Deploy successfully " + storeSrc + " to address " + result.address, "info");
  logLn("https://devtools.icetea.io/contract.html?address=" + result.address, "info");
  return result;
});

gulp.task("default", ["build"], async () => {});
