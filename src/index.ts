import "dotenv/config";
import { build, getBranch, getCrumbValue, getIndexPage, login } from "./util";

const cookieSet = new Set();

const addCookies = (setCookieHeader: any) => {
  const cookies = setCookieHeader.split(",");
  cookies.forEach((cookie: any) => cookieSet.add(cookie));
};

const getCookieStr = () => {
  return Array.from(cookieSet).join("; ");
};

const main = async () => {
  const currentBranch = getBranch();
  console.log("Current branch is:", currentBranch);
  // Add validation for production mode
  if (process.env.PW_MODE === "production") {
    const userConfirmation = prompt(
      `You are about to build and publish a production version. Are you sure? (yes/no)`
    );
    if (userConfirmation !== "yes") {
      console.log("Operation cancelled by the user.");
      return;
    }
  }

  const sckLogin = await login();
  addCookies(sckLogin);
  const response = await getIndexPage({
    Cookie: getCookieStr(),
  });
  addCookies(response.headers.get("set-cookie"));
  const html = await response.text();
  const crumbValue = getCrumbValue(html);
  try {
    const responseBuild = await build({
      crumbValue: crumbValue,
      Cookie: getCookieStr(),
    });
    const text = await responseBuild.statusText;
    console.log("Build response:", text);
    console.log(`Build triggered successfully for branch: ${currentBranch}`);
    const projectName = process.env.PW_PROJECT_NAME;
    console.log(`Project Name: ${projectName}`);
    console.log("Build successful!");
  } catch (error) {
    console.error("Error during build:", error);
    throw error;
  }
};

main();
