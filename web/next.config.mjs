import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

const isProd = process.env.NODE_ENV === "production";

const config = isProd
  ? nextConfig
  : withPWA({
      dest: "public",
      register: true,
      skipWaiting: true,
    })(nextConfig);

export default config;
