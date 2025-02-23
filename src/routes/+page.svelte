<script lang="ts">
	import type { Database } from '$lib';
	import { onMount } from 'svelte';

	let { data } = $props();
	let { user } = $derived(data);

	let url = $state('');
	let articles: Database['public']['Tables']['articles']['Row'][] = $state([]);

	onMount(async () => {
		await fetchArticles(user?.id ?? '');
	});

	async function fetchArticles(user_id: string) {
		const res = await fetch(`/api/articles?user_id=${user_id}`);
		const data = await res.json();
		articles = data;
	}

	async function saveArticle() {
		const res = await fetch('/api/articles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url, user_id: user?.id })
		});

		const result = await res.json();
		if (result.error) {
			alert(`エラー: ${result.error}`);
		} else {
			alert('記事を保存しました！');
			fetchArticles(user?.id ?? '');
		}
	}
</script>

<header class="sticky top-0 z-10 h-15 w-full bg-white p-2">
	<form onsubmit={saveArticle} class="flex w-full items-center justify-between gap-2">
		<input
			class="rounded-md border border-gray-300 p-2"
			type="url"
			bind:value={url}
			placeholder="記事のURL"
			required
		/>
		<button type="submit" class="rounded-md bg-blue-500 px-4 py-2 text-white">保存</button>
	</form>
</header>

<div class="w-full p-2">
	<ul class="grid w-full grid-cols-1 gap-2">
		{#each articles as article}
			<li class="h-25 w-full rounded-md bg-gray-100 p-3">
				<a href={article.url} target="_blank" class="flex h-full items-center gap-2">
					<div class="h-10 w-10 rounded-md bg-gray-200">
						<img src={article.thumbnail} alt="" class="object-fit h-full w-full rounded-sm" />
					</div>
					<div class="flex-1 text-sm">{article.title}</div>
				</a>
			</li>
		{/each}
	</ul>
</div>
