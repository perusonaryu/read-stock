<script lang="ts">
	import type { Database } from '$lib';
	import { onMount } from 'svelte';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { mdiTrashCan, mdiTextBoxCheck } from '@mdi/js';
	import Loading from '$components/utils/Loading.svelte';

	let { data } = $props();
	let { user } = $derived(data);
	let isLoading = $state(false);

	let url = $state('');
	let articles: Database['public']['Tables']['articles']['Row'][] = $state([]);

	onMount(async () => {
		isLoading = true;
		await fetchArticles(user?.id ?? '');
		isLoading = false;
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
			body: JSON.stringify({ url })
		});

		const result = await res.json();
		if (result.error) {
			alert(`エラー: ${result.error}`);
		} else {
			alert('記事を保存しました！');
			articles = [result.data, ...articles];
			url = '';
		}
	}

	// スワイプ関連の状態
	let touchStartX = $state(0);
	let touchEndX = $state(0);
	let activeSwipeItem: string | null = $state(null);
	let swipeLeft = $state(false);
	let swipeRight = $state(false);

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
				alert('記事を更新しました！');
			}
		} catch (error) {
			console.error('Error updating article status:', error);
		}
	}

	async function deleteArticle(articleID: string) {
		try {
			const res = await fetch('/api/articles', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ articleID })
			});

			if (res.ok) {
				articles = articles.filter((a) => a.id !== articleID);
				alert('記事を削除しました！');
			} else {
				alert('記事の削除に失敗しました。');
			}
		} catch (error) {
			console.error('Error deleting article:', error);
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

		// 左スワイプの場合
		if (swipeDistance < 0) {
			articleElement.style.transform = `translateX(${Math.max(swipeDistance, -(articleElement.clientWidth * 0.9))}px)`;
			swipeLeft = true;
			swipeRight = false;
		}
		// 右スワイプの場合
		else {
			articleElement.style.transform = `translateX(${Math.min(swipeDistance, articleElement.clientWidth * 0.9)}px)`;
			swipeRight = true;
			swipeLeft = false;
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
		if (swipeDistance > 0 && swipeDistance > SWIPE_THRESHOLD) {
			deleteArticle(article.id);
		} else if (swipeDistance < 0 && Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
			// 既読状態に変更
			toggleReadStatus(article);
		}

		// 要素を元の位置に戻す
		articleElement.style.transform = 'translateX(0)';

		// リセット
		activeSwipeItem = null;
		touchStartX = 0;
		touchEndX = 0;
		swipeLeft = false;
		swipeRight = false;
	}
</script>

<div class="h-full overflow-y-auto">
	{#if isLoading}
		<div class="flex h-full w-full items-center justify-center">
			<Loading size="lg" />
		</div>
	{:else}
		<ul class="grid w-full grid-cols-1">
			{#each articles as article, i}
				<li class="relative h-25 w-full overflow-hidden border-b border-gray-200">
					<div
						class:read={!!article.read_at}
						class={`absolute z-10 h-full w-full ${i % 2 === 0 ? 'bg-white' : 'bg-sky-100'} p-2`}
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
					</div>
					<div
						class={`absolute top-0 left-0 z-1 h-full w-full
					 ${!!article.read_at ? 'bg-gray-400' : 'bg-emerald-400'}
					 ${swipeLeft ? 'block' : 'hidden'}`}
					>
						<div class="flex h-full w-full items-center justify-end pr-5">
							<SvgIcon type="mdi" path={mdiTextBoxCheck} />
						</div>
					</div>
					<div
						class={`absolute top-0 right-0 z-1 h-full w-full bg-red-400 ${
							swipeRight ? 'block' : 'hidden'
						}`}
					>
						<div class="flex h-full w-full items-center pl-5">
							<SvgIcon type="mdi" path={mdiTrashCan} />
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<footer class="fixed bottom-0 z-10 w-full bg-gray-100 p-3 shadow-md">
	<form onsubmit={saveArticle} class="flex w-full gap-3">
		<div class="flex-1">
			<input
				class="w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
				type="url"
				bind:value={url}
				placeholder="記事のURLを入力してください"
				required
			/>
		</div>
		<div>
			<button
				type="submit"
				class="w-full rounded-lg bg-blue-500 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
			>
				保存
			</button>
		</div>
	</form>
</footer>

<style>
	li {
		user-select: none;
		touch-action: pan-y;
	}

	.read {
		background-color: #f0f8ff;
		border-left: 8px solid oklch(0.765 0.177 163.223);
	}
</style>
