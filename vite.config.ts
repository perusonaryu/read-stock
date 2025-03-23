import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		VitePWA({
			// PWAの基本設定
			registerType: 'autoUpdate',
			manifest: {
				name: 'Read Stack',
				short_name: 'ReadStack',
				description: 'Read Stack',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{
						src: 'favicon.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'favicon.png',
						sizes: '512x512',
						type: 'image/png'
					}
				],
				start_url: '/',
				scope: '/'
			},
			// ServiceWorkerの詳細設定
			workbox: {
				// キャッシュ対象となるファイルの設定
				globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp}'],
				// その他Workboxの設定
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1年間
							}
						}
					},
					// APIリクエストのキャッシュ設定例
					{
						urlPattern: /^https:\/\/api\.yourapp\.com\/api/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 // 24時間
							}
						}
					}
				]
			},
			// 開発モードの設定
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	]
});
