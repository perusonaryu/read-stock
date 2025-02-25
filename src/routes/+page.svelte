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
			body: JSON.stringify({ url, userID: user?.id })
		});

		const result = await res.json();
		if (result.error) {
			alert(`エラー: ${result.error}`);
		} else {
			alert('記事を保存しました！');
			fetchArticles(user?.id ?? '');
		}
	}

	// スワイプ関連の状態
	let touchStartX = 0;
	let touchEndX = 0;
	let activeSwipeItem: string | null = $state(null);

	// スワイプのしきい値（ピクセル）
	const SWIPE_THRESHOLD = 100;

	// 既読状態を切り替える関数
	async function toggleReadStatus(article: Database['public']['Tables']['articles']['Row']) {
		try {
			const response = await fetch('/api/articles', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					articleID: article.id,
					isRead: article.read_at === null // nullなら既読にする
				})
			});

			if (response.ok) {
				const result = await response.json();
				articles = articles.map((a) =>
					a.id === article.id ? { ...a, read_at: result.data.read_at } : a
				);
			}
		} catch (error) {
			console.error('Error updating article status:', error);
		}
	}

	// タッチイベントハンドラ
	function handleTouchStart(
		e: TouchEvent,
		article: Database['public']['Tables']['articles']['Row']
	) {
		touchStartX = e.touches[0].clientX;
		activeSwipeItem = article.id;
	}

	function handleTouchMove(e: TouchEvent, articleElement: HTMLElement) {
		if (!activeSwipeItem) return;

		touchEndX = e.touches[0].clientX;
		const swipeDistance = touchEndX - touchStartX;

		// 右スワイプの場合のみ移動させる
		if (swipeDistance > 0) {
			articleElement.style.transform = `translateX(${Math.min(swipeDistance, 150)}px)`;
			articleElement.style.opacity = (1 - (Math.min(swipeDistance, 150) / 150) * 0.3).toString();
		}
	}

	function handleTouchEnd(
		e: TouchEvent,
		article: Database['public']['Tables']['articles']['Row'],
		articleElement: HTMLElement
	) {
		if (!activeSwipeItem) return;

		const swipeDistance = touchEndX - touchStartX;

		// スワイプが閾値を超えた場合
		if (swipeDistance > SWIPE_THRESHOLD) {
			// 既読状態に変更
			toggleReadStatus(article);
		}

		// 要素を元の位置に戻す
		articleElement.style.transform = 'translateX(0)';
		articleElement.style.opacity = '1';

		// リセット
		activeSwipeItem = null;
		touchStartX = 0;
		touchEndX = 0;
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
			<li
				class="h-25 w-full rounded-md bg-gray-100 p-2 transition-transform duration-300"
				class:read={article.read_at !== null}
				ontouchstart={(e) => handleTouchStart(e, article)}
				ontouchmove={(e) => handleTouchMove(e, e.currentTarget)}
				ontouchend={(e) => handleTouchEnd(e, article, e.currentTarget)}
				ontouchcancel={(e) => handleTouchEnd(e, article, e.currentTarget)}
			>
				<a href={article.url} target="_blank" class="flex h-full items-center gap-2">
					<div class="h-20 w-20 rounded-md bg-gray-200">
						<img src={article.thumbnail} alt="" class="object-fit h-full w-full rounded-sm" />
					</div>
					<div class="flex-1 text-sm">{article.title}</div>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	li {
		position: relative;
		overflow: hidden;
		user-select: none;
		touch-action: pan-y;
	}

	.read {
		background-color: #f0f8ff;
		border-left: 8px solid #4caf50;
	}
</style>
