/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 개발 서버와 겹치지 않게 빌드 검증용 출력 폴더를 따로 쓸 수 있다 (기본값은 .next)
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
