<script lang="ts">
	import { onMount } from 'svelte';

	let online = true;

	onMount(() => {
		// 現在のオンライン状態を確認
		online = navigator.onLine;

		// オンライン状態の変化を監視
		window.addEventListener('online', () => {
			online = true;
		});

		window.addEventListener('offline', () => {
			online = false;
		});
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-4 text-center">
	<h1 class="mb-6 text-3xl font-bold">オフラインです</h1>

	{#if !online}
		<p class="mb-4 text-lg text-gray-600">
			インターネット接続がありません。接続が回復するのをお待ちください。
		</p>
		<p class="text-sm text-gray-500">一部の機能はオフラインでも利用できます。</p>
	{:else}
		<p class="mb-6 text-lg text-green-600">接続が回復しました！</p>
		<a
			href="/"
			class="rounded-md bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
		>
			ホームに戻る
		</a>
	{/if}
</div>
