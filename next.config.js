/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  sw: '/sw.js',
  publicExcludes: ['!icons/**/*', '!screenshots/**/*'],
});

const nextConfig = {
  // instead of wrapping our Component inside <StricMode/> we set this to true.
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
