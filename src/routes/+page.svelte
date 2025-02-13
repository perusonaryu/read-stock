<script lang="ts">
	import { supabase } from '$lib';
	import type { Database } from '$lib';
	import type { Session, User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let title = '';
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
			body: JSON.stringify({ title, url, user_id: userData.id })
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

<form on:submit|preventDefault={saveArticle}>
	<input type="text" bind:value={title} placeholder="タイトル" required />
	<input type="url" bind:value={url} placeholder="記事のURL" required />
	<button type="submit">保存</button>
</form>

<ul>
	{#each $articles as article}
		<li>{article.title} - <a href={article.url} target="_blank">{article.url}</a></li>
	{/each}
</ul>
