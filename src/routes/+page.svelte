<script lang="ts">
	import { supabase } from '$lib';
	import type { Database } from '$lib';
	import type { Session, User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let url = '';
	let articles = writable<Database['public']['Tables']['articles']['Row'][]>([]);
	let user = writable<User | null>(null);

	onMount(async () => {
		const { data } = await supabase.auth.getSession();
		const session: Session | null = data.session;
		user.set(session?.user ?? null);

		if (session?.user) {
			fetchArticles(session.user.id);
		}
	});

	async function fetchArticles(user_id: string) {
		const res = await fetch(`/api/articles?user_id=${user_id}`);
		const data = await res.json();
		articles.set(data);
	}

	async function saveArticle() {
		const userData = $user;
		if (!userData) return alert('ログインしてください');

		const res = await fetch('/api/articles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url, user_id: userData.id })
		});

		const result = await res.json();
		if (result.error) {
			alert(`エラー: ${result.error}`);
		} else {
			alert('記事を保存しました！');
			fetchArticles(userData.id);
		}
	}
</script>

<header class="sticky top-0 z-10 h-15 w-full bg-white p-2">
	<form
		on:submit|preventDefault={saveArticle}
		class="flex w-full items-center justify-between gap-2"
	>
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
		{#each $articles as article}
			<li class="h-25 w-full rounded-md bg-gray-100 p-3">
				<a href={article.url} target="_blank" class="flex h-full items-center gap-2">
					<div class="h-10 w-10 rounded-md bg-gray-200">
						<img src={article.thumbnail} alt="" class="object-fit h-full w-full rounded-sm" />
					</div>
					<div class="flex-1 text-sm">{article.title}</div>
				</a>
			</li>
			<!-- <li>{article.title} - <a href={article.url} target="_blank">{article.url}</a></li> -->
		{/each}
	</ul>
</div>
