import { test, expect } from "bun:test";
import { build, getCrumbValue, getIndexPage, login } from "./util";
// Helper function to extract cookies from the set-cookie header
const extractCookies = (setCookieHeader: any) => {
  return setCookieHeader
    .split(",")
    .map((cookie: any) => cookie.split(";")[0])
    .join("; ");
};

test("login function returns a set-cookie header", async () => {
  const setCookieHeader = await login();
  expect(setCookieHeader).toBeDefined();
  expect(typeof setCookieHeader).toBe("string");
});

test("getCrumbValue function extracts crumb value correctly", async () => {
  // Mock the HTML that your getIndexPage would return
  const mockHtml =
    '<html><body><input type="hidden" name="crumb" data-crumb-value="test-crumb-value" /></body></html>';
  const crumbValue = getCrumbValue(mockHtml);
  expect(crumbValue).toBe("test-crumb-value");
});

test("getIndexPage function sets the Cookie header with cookies from login", async () => {
  const setCookieHeader = await login();
  // Extract the cookies from the header returned by the login function
  const cookieStr = extractCookies(setCookieHeader);

  const response = await getIndexPage({ Cookie: cookieStr });

  // Check if the response is okay (status code 200)
  expect(response.ok).toBe(true);
  // Optionally, you can check if the response has set new cookies
  // expect(response.headers.get('set-cookie')).toBeDefined();
});

test("build function sends crumbValue and Cookie in the request", async () => {
  // Step 1: Login to get the initial set of cookies
  const loginSetCookieHeader = await login();
  let cookies = extractCookies(loginSetCookieHeader);

  // Step 2: Get the index page, which sets additional cookies and provides the crumb value
  const indexPageResponse = await getIndexPage({ Cookie: cookies });
  const indexPageSetCookieHeader = indexPageResponse.headers.get("set-cookie");
  if (indexPageSetCookieHeader) {
    cookies = extractCookies(indexPageSetCookieHeader);
  }
  const html = await indexPageResponse.text();
  const crumbValue = getCrumbValue(html);

  // Step 3: Call the build function with the accumulated cookies and the obtained crumb value
  const responseBuild = await build({
    crumbValue: crumbValue,
    Cookie: cookies,
  });

  // Check if the build function was successful
  expect(responseBuild.ok).toBe(true);
  // Optionally, you can check the response status code
  // expect(responseBuild.status).toBe(200);
});
