declare module "bun" {
    interface Env {
      PW_USERNAME: string;
      PW_PASSWORD: string;
      PW_BASE_URL: string;
      PW_PROJECT_NAME: string;
    }
  }