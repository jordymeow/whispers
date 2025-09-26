/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/@:username',
        destination: '/[username]',
      },
    ];
  },
};

module.exports = nextConfig;