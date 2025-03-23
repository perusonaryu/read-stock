<!--
 * @file share-target/+page.svelte
 * @description 外部アプリから共有されたコンテンツを処理するコンポーネント
 * このページはWeb Share Target APIによって呼び出されます
 -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	/**
	 * 共有されたURLを保存する関数
	 * @param {string} url - 保存するURL
	 * @param {string} title - リンクのタイトル（オプション）
	 */
	async function saveSharedLink(url: string, title?: string) {
		try {
			// ローディング表示
			loading = true;
			error = null;

			// APIを呼び出してURLを保存
			const res = await fetch('/api/articles', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			const result = await res.json();
			if (result.error) {
				throw new Error(result.error);
			}

			// 保存成功時はホームページに戻る
			setTimeout(() => {
				// 保存完了後、メインページへリダイレクト
				goto('/');
			}, 1500);
		} catch (err) {
			// エラー処理
			console.error('リンク保存エラー:', err);
			error = err instanceof Error ? err.message : 'リンクの保存中にエラーが発生しました。';
		} finally {
			// ローディング完了
			loading = false;
		}
	}

	// 状態管理
	let loading = $state(true);
	let error = $state<string | null>(null);
	let url = $state('');
	let title = $state('');
	let text = $state('');

	onMount(() => {
		// URLパラメータから共有情報を取得
		const params = $page.url.searchParams;
		url = params.get('url') || '';
		title = params.get('title') || '';
		text = params.get('text') || '';

		// URLがある場合は自動的に保存処理を実行
		if (url) {
			saveSharedLink(url, title || text);
		} else if (text && text.match(/https?:\/\/[^\s]+/)) {
			// textにURLが含まれている場合は抽出して保存
			const extractedUrl = text.match(/https?:\/\/[^\s]+/)?.[0] || '';
			if (extractedUrl) {
				saveSharedLink(extractedUrl, title);
			} else {
				loading = false;
				error = 'URLを見つけることができませんでした。';
			}
		} else {
			loading = false;
			error = '有効なURLが共有されていません。';
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
		<h1 class="mb-6 text-center text-xl font-bold">共有リンクを処理中</h1>

		{#if loading}
			<div class="flex flex-col items-center justify-center">
				<div
					class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"
				></div>
				<p>リンクを追加しています...</p>
				{#if url}
					<p class="mt-2 truncate text-sm text-gray-500">{url}</p>
				{/if}
			</div>
		{:else if error}
			<div class="rounded-lg bg-red-100 p-4 text-red-700">
				<p>{error}</p>
			</div>
			<button
				class="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				on:click={() => goto('/')}
			>
				ホームに戻る
			</button>
		{:else}
			<div class="rounded-lg bg-green-100 p-4 text-green-700">
				<p>リンクが正常に追加されました！</p>
			</div>
			<button
				class="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				on:click={() => goto('/')}
			>
				ホームに戻る
			</button>
		{/if}
	</div>
</div>
