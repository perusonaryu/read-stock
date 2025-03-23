<script lang="ts">
	import '../app.css';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import PwaInstall from '$lib/components/PwaInstall.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	// サイドバーの表示状態を管理する変数
	let isSidebarOpen = $state(false);

	// PWA更新通知用の状態変数
	let updateAvailable = $state(false);
	let reloadSW: ((forceReload?: boolean) => Promise<void>) | undefined;

	// サイドバーの表示/非表示を切り替える関数
	function toggleSidebar(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		isSidebarOpen = !isSidebarOpen;
	}

	// PWA更新を適用する関数
	function applyUpdate() {
		updateAvailable = false;
		reloadSW?.(true);
	}

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}

			if (!newSession) {
				goto('/login');
			}
		});

		// ServiceWorkerの登録
		if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
			// 開発環境では登録しない
			if (import.meta.env.DEV) return data.subscription.unsubscribe();

			// Service Workerを登録
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('Service Worker登録完了:', registration);
				})
				.catch((error) => {
					console.error('Service Worker登録エラー:', error);
				});
		}

		return () => data.subscription.unsubscribe();
	});
</script>

<!-- PWA更新通知 -->
{#if updateAvailable}
	<div
		class="fixed right-4 bottom-4 z-50 rounded-lg bg-white p-4 shadow-lg"
		transition:fly={{ y: 20, duration: 300 }}
	>
		<p class="mb-2">新しいバージョンが利用可能です</p>
		<div class="flex gap-2">
			<button
				class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				onclick={applyUpdate}
			>
				更新する
			</button>
			<button
				class="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
				onclick={() => (updateAvailable = false)}
			>
				後で
			</button>
		</div>
	</div>
{/if}

<!-- サイドバーコンポーネント -->
{#if isSidebarOpen}
	<div
		class="fixed inset-0 z-30 bg-black/10"
		onclick={toggleSidebar}
		onkeydown={(e) => e.key === 'Enter' && toggleSidebar(e)}
		role="button"
		tabindex="0"
		aria-label="サイドバーを閉じる"
		transition:fade={{ duration: 200 }}
	></div>
	<aside
		class="fixed top-0 left-0 z-40 h-screen w-64 bg-white pt-16 shadow-lg"
		transition:fly={{ x: -300, duration: 300 }}
	>
		<nav class="p-4">
			<ul class="space-y-2">
				<li><a href="/" class="block rounded p-2 hover:bg-gray-100">未読記事</a></li>
				<li><a href="/profile" class="block rounded p-2 hover:bg-gray-100">閲覧済み記事</a></li>
			</ul>
		</nav>
	</aside>
{/if}

<header class="fixed top-0 z-20 flex w-full items-center bg-gray-100 p-3">
	<!-- ハンバーガーボタン -->
	<button
		class="mr-4 rounded p-1 hover:bg-gray-200 focus:outline-none"
		onclick={toggleSidebar}
		aria-label="メニューを開く"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	</button>
	<h1 class="text-2xl font-bold">Read Stack</h1>
</header>

<div class="mt-[56px] h-[calc(100svh-56px)]">
	{@render children()}
</div>

<!-- PWAインストールプロンプト -->
<PwaInstall />
