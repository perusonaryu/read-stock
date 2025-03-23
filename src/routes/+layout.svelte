<script lang="ts">
	import '../app.css';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	// サイドバーの表示状態を管理する変数
	let isSidebarOpen = $state(false);

	// サイドバーの表示/非表示を切り替える関数
	function toggleSidebar(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		isSidebarOpen = !isSidebarOpen;
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

		return () => data.subscription.unsubscribe();
	});
</script>

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
