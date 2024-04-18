import request, { BASE_URL } from "./request";

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
};

export const getBranch = () => {
  const args = process.argv.slice(2);
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
    value: getBranch(),
    statusCode: "303",
    redirectTo: ".",
    "Jenkins-Crumb": crumbValue,
    json: JSON.stringify({
      parameter: {
        name: "branch",
        value: getBranch(),
      },
      statusCode: "303",
      redirectTo: ".",
      "Jenkins-Crumb": crumbValue,
    }),
    Submit: "Build",
  });

  request(url, {
    method: "POST",
    headers: {
      Cookie,
    },
    body,
  })
    .then(async (response) => {
      console.log("Response:", response);
      const text = await response.text();
      console.log("Text:", text);
      // Handle the response
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
