import request, { BASE_URL } from "./request";
import { execa } from "execa";
export const getCrumbValue = (html: string) => {
  const crumbValueRegex = /data-crumb-value="(.*?)"/;
  const match = crumbValueRegex.exec(html);
  const crumbValue = match ? match[1] : null;
  return crumbValue;
};

interface LoginData {
  j_username: string;
  j_password: string;
  from: string;
  Submit: string;
  remember_me: string;
}

const loginData: LoginData = {
  j_username: process.env.PW_USERNAME,
  j_password: process.env.PW_PASSWORD,
  from: "/",
  Submit: "Sign+in",
  remember_me: "on",
} as any;

export async function executeCommand(command: string) {
  try {
    const [cmd, ...args] = command.split(" ");
    const { stdout } = await execa(cmd, args);
    return stdout;
  } catch (error) {
    console.error(`执行命令 "${command}" 时出错:`, error);
    return null;
  }
}

export const getBranch = async () => {
  const commandRes = await executeCommand("git rev-parse --abbrev-ref HEAD");
  if (!commandRes) {
    console.error("获取分支名称时出错。");
    return null;
  }
  const defaultBranch = commandRes.trim();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    return defaultBranch;
  }
  return args[0];
};

export async function login(): Promise<any> {
  try {
    const response = await request(`${BASE_URL}/j_spring_security_check`, {
      method: "POST",
      credentials: "include",
      body: new URLSearchParams(loginData as any),
      redirect: "manual",
    });

    if (response.redirected) {
      // Handle redirects if needed
      console.log("Redirected to:", response.url);
    }
    // const cookies = await response.headers.getSetCookie();
    // const crumb = await getCrumbValue(await response.text());
    return await response.headers.get("set-cookie");
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

export async function getIndexPage({ Cookie }: { Cookie: string }) {
  const response = await request(`${BASE_URL}/`, {
    headers: {
      Cookie,
    },
  });

  if (response.redirected) {
    console.log("Redirected to:", response.url);
  }

  return response;
}

export async function build({
  crumbValue,
  Cookie,
}: {
  crumbValue: any;
  Cookie: string;
}) {
  // Example usage
  const url = `${BASE_URL}/view/${encodeURI(
    process.env.PW_PROJECT_NAME
  )}/build?delay=0sec`;
  const body = new URLSearchParams({
    name: "$branch",
    value: await getBranch(),
    statusCode: "303",
    redirectTo: ".",
    "Jenkins-Crumb": crumbValue,
    json: JSON.stringify({
      parameter: {
        name: "branch",
        value: await getBranch(),
      },
      statusCode: "303",
      redirectTo: ".",
      "Jenkins-Crumb": crumbValue,
    }),
    Submit: "Build",
  } as any);

  return request(url, {
    method: "POST",
    headers: {
      Cookie,
    },
    body,
  });
}
